CREATE TABLE "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"date" timestamp NOT NULL,
	"update_date" timestamp DEFAULT now(),
	"category" varchar(100),
	"tags" text,
	"summary" text,
	"content" text
);
