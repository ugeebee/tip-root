package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"sync"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	DB   *pgxpool.Pool
	once sync.Once
)

func InitDB() *pgxpool.Pool {
	once.Do(func() {
		connStr := os.Getenv("DATABASE_URL")
		if connStr == "" {
			log.Fatal("DATABASE_URL environment variable is not set")
		}

		config, err := pgxpool.ParseConfig(connStr)
		if err != nil {
			log.Fatalf("Unable to parse database config: %v", err)
		}

		config.MaxConns = 25
		config.MinConns = 5
		config.MaxConnIdleTime = 30 * time.Minute

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		pool, err := pgxpool.NewWithConfig(ctx, config)
		if err != nil {
			log.Fatalf("Unable to connect to database: %v", err)
		}

		if err := pool.Ping(ctx); err != nil {
			log.Fatalf("Database ping failed: %v", err)
		}

		fmt.Println("Successfully locked connection to PostgreSQL!")
		DB = pool
	})

	return DB
}