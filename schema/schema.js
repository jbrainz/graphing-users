const graphql = require("graphql")
const axios = require("axios")

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
} = graphql

const CompanyType = new GraphQLObjectType({
  name: "Company",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType),
      resolve(parentValue, args) {
        return axios
          .get(`http://localhost:3000/companies/${parentValue.id}/users`)
          .then((res) => res.data)
      },
    },
  }),
})

//instruct graphql of the presence of a user
//i.e a user that has an ID and a name
//the GraphQLObjectType required two  properties
const UserType = new GraphQLObjectType({
  name: "User",
  //The field properties tells graphql all of the different properties a user has.
  //WE also instruct graphql what type of data to expect.
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      resolve(parentValue, args) {
        return axios
          .get(`http://localhost:3000/companies/${parentValue.companyId}`)
          .then((resp) => resp.data)
      },
    },
  }),
})

//RootQuery helps us jump into the graph of our data.
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    user: {
      type: UserType,
      //args => arguments, if you give me a user i will give you back the userType
      args: { id: { type: GraphQLString } },
      //the resolve function is what resolves our request of finding a user
      //it takes us to our database
      //the resolve function is what grabs the query data, from the database
      resolve(parentValue, args) {
        return axios
          .get(`http://localhost:3000/users/${args.id}`)
          .then((resp) => resp.data)
      },
    },
    company: {
      type: CompanyType,
      //args => arguments, if you give me a user i will give you back the userType
      args: { id: { type: GraphQLString } },
      //the resolve function is what resolves our request of finding a user
      //it takes us to our database
      //the resolve function is what grabs the query data, from the database
      resolve(parentValue, args) {
        return axios
          .get(`http://localhost:3000/companies/${args.id}`)
          .then((resp) => resp.data)
      },
    },
  },
})

const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addUser: {
      type: UserType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        companyId: { type: GraphQLString },
      },
      resolve(parentValue, { firstName, age }) {
        return axios
          .post(`http://localhost:3000/users`, { firstName, age })
          .then((res) => res.data)
      },
    },
    deleteUser: {
      type: UserType,
      args: { id: { type: new GraphQLNonNull(GraphQLString) } },
      resolve(parentValue, args) {
        return axios
          .delete(`http://localhost:3000/users/${args.id}`)
          .then((res) => res.data)
      },
    },
    editUser: {
      type: UserType,
      args: {
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        id: { type: new GraphQLNonNull(GraphQLString) },
        companyId: { type: GraphQLString },
      },
      resolve(parentValue, { firstName, age, id, companyId }) {
        return axios
          .patch(`http://localhost:3000/users/${id}`, {
            firstName,
            age,
            companyId,
          })
          .then((res) => res.data)
      },
    },
  },
})

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation,
})
