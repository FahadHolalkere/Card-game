package main

import (
	"context"
	"fmt"
	"math/rand"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

var mongoClient *mongo.Client
var collection *mongo.Collection

func init() {
	// Connect to MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	err := godotenv.Load()

	if err != nil {
		panic(err)
	}
	mongoURI := os.Getenv("mongoURI") // add your MongoDB URL inplace of "os.Getenv("mongoURI")"
	clientOptions := options.Client().ApplyURI(mongoURI).SetReadPreference(readpref.Primary())
	client, err := mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		fmt.Println("Error connecting to MongoDB:", err)
		return
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		fmt.Println("Error pinging MongoDB:", err)
		return
	}

	mongoClient = client
	collection = client.Database("CardGame").Collection("Cards")
}

type Game struct {
	Deck        []string `json:"deck"`
	Username    string   `json:"username"`
	Allcards    int      `json:"allcards"`
	Defusecard  int      `json:"defusecard"`
	Leaderboard []User   `json:"leaderboard"`
}

type User struct {
	Username string `json:"username"`
	Points   int    `json:"points"`
}

type NewUserRequest struct {
	Username  string `json:"username"`
	Gamestate Game   `json:"gamestate"`
}

func main() {
	router := gin.Default()

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"}
	router.Use(cors.New(config))

	router.GET("/startGame", startGame)
	router.POST("/drawCard", drawCard)
	router.GET("/leaderboard", getLeaderboard)
	router.POST("/addUser", addUser)

	router.Run(":8080")
}

func startGame(c *gin.Context) {
	username := c.Query("username")
	game := Game{
		Deck:       shuffleDeck(),
		Username:   username,
		Allcards:   5,
		Defusecard: 0,
	}
	c.JSON(http.StatusOK, game)
}

func addUser(c *gin.Context) {
	var newUserRequest NewUserRequest
	if err := c.BindJSON(&newUserRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	newUser := NewUserRequest{
		Username:  newUserRequest.Username,
		Gamestate: newUserRequest.Gamestate,
	}

	ctx := context.Background()
	_, err := collection.InsertOne(ctx, newUser)
	if err != nil {
		fmt.Println("Error adding new user:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User added successfully", "user": newUser})
}

func getLeaderboard(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()
	leaderboard, err := getLeaderboardFromMongo(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve leaderboard"})
		return
	}

	c.JSON(http.StatusOK, leaderboard)
}

func shuffleDeck() []string {
	deck1 := []string{"Cat", "Defuse", "Shuffle", "Bomb", "Cat", "Defuse", "Bomb", "Cat", "Defuse", "Bomb"}
	rand.Seed(time.Now().UnixNano())

	var deck []string

	for i := 0; i < 5; i++ {
		randomIndex := rand.Intn(len(deck1))
		deck = append(deck, deck1[randomIndex])

		deck1 = append(deck1[:randomIndex], deck1[randomIndex+1:]...)
	}
	return deck
}

func drawCard(c *gin.Context) {
	var newUserRequest NewUserRequest
	if err := c.BindJSON(&newUserRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	updatedUser := NewUserRequest{
		Username:  newUserRequest.Username,
		Gamestate: newUserRequest.Gamestate,
	}
	username := updatedUser.Username
	game, documentID := getGameStateMongo(username)

	if documentID.IsZero() {
		c.JSON(http.StatusNotFound, gin.H{"error": "Game state not found"})
		return
	}

	if err := saveGameStateMongo(documentID, updatedUser.Gamestate); err != nil {
		fmt.Println("drawCard - Error saving game state:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save game state"})
		return
	}

	c.JSON(http.StatusOK, game)
}

func saveGameStateMongo(documentID primitive.ObjectID, game Game) error {
	ctx := context.Background()
	filter := bson.D{{Key: "_id", Value: documentID}}
	update := bson.D{{Key: "$set", Value: bson.D{{Key: "gamestate", Value: game}}}}

	result, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		fmt.Println("saveGameStateMongo - Error updating game state:", err)
		return err
	}

	if result.ModifiedCount == 0 {
		fmt.Println("saveGameStateMongo - No documents were updated")
		return err
	}

	return nil
}

func getGameStateMongo(username string) (Game, primitive.ObjectID) {
	ctx := context.Background()
	filter := bson.D{{Key: "username", Value: username}}

	var result struct {
		ID        primitive.ObjectID `bson:"_id"`
		Gamestate Game               `bson:"gamestate"`
	}

	err := collection.FindOne(ctx, filter).Decode(&result)

	if err != nil {
		fmt.Println("Error retrieving game state:", err)
		return Game{}, primitive.NilObjectID
	}

	return result.Gamestate, result.ID
}

func getLeaderboardFromMongo(ctx context.Context) ([]NewUserRequest, error) {
	opts := options.Find().SetSort(bson.D{{Key: "gamestate.leaderboard.points", Value: -1}})
	cursor, err := collection.Find(context.TODO(), bson.D{}, opts)
	if err != nil {
		fmt.Println("Error retrieving leaderboard:", err)
		return nil, err
	}

	var leaderboard []NewUserRequest
	for cursor.Next(ctx) {
		var user NewUserRequest
		if err := cursor.Decode(&user); err != nil {
			fmt.Println("Error decoding user:", err)
			return nil, err
		}
		leaderboard = append(leaderboard, user)
	}

	if err := cursor.Err(); err != nil {
		fmt.Println("Cursor error:", err)
		return nil, err
	}
	defer cursor.Close(ctx)

	return leaderboard, nil
}
