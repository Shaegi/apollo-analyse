const { ApolloServer, gql } = require('apollo-server');
const casual = require('casual')
const { cloneDeep } = require('lodash')

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: Author
  }

  type Author  {
    name: String
    books: [Book]
  }

  type ErrorBook {
    title: String
    author: ErrorAuthor
  }

  type ErrorAuthor {
    name: String
    books: [ErrorBook]
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [Book]
    maybeError: [ErrorBook]
    longRunningQuery: [Book]
    randomAmountOfBooks: [Book]
  }
`;

const books = [
    {
      title: 'The Awakening',
      author: {name: 'Kate Chopin'},
    },
    {
      title: 'The Sleep',
      author: {name: 'Kate Chopin2'},
    },
    {
      title: 'City of Glass',
      author: {
        name: 'Paul Auster',
        books: [
          {
            title: 'City of Glass'
          },
          {
            title: 'City of Grass'
          },
          {
            title: 'City of Gas'
          }
        ]
      },
    },
  ];

  // Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
    Query: {
      books: () => books,
      longRunningQuery: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(books)
          }, (Math.floor(Math.random() * 6) + 1) * 1000)
        })
      },
      maybeError: () => {
        return casual.boolean ? new Error('Woops you lost the coin-flip') : books
      },
      randomAmountOfBooks: () => {
        const booksCount = (Math.floor(Math.random() * books.length) + 1) +1 
        const result = cloneDeep(books).slice(0, booksCount)
        console.log(result.length)
        return cloneDeep(books).slice(0, booksCount)
      }
    },
    ErrorBook: {
      author: parent => {
        if(casual.boolean) {
          return parent.author
        } else {
          return new Error('Error on deeper Level')
        }
      }
    },
    Book: {
      author: (parent) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(parent.author)
          }, 1000)
        })
      }
    }
  };

  console.log('??',process.cwd)
  // The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers, tracing: true, plugins: [
    require(`../src/middleware/index.js`)
] });


// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});