const { gql } = require('apollo-server');

const typeDefs = gql`
  type Usuario {
    id: ID
    nombre: String
    apellido: String
    email: String
    creado: String
  }

  type Token {
    token: String
  }

  type Producto {
    id: ID
    nombre: String
    existencia: Int
    precio: Float
    creado: String
  }

  type Cliente {
    id: ID
    nombre: String
    apellido: String
    empresa: String
    email: String
    telefono: String
    vendedor: ID
  }

  input UsuarioInput {
    nombre: String!
    apellido: String!
    email: String!
    password: String!
  }

  input AutenticarInput {
    email: String!
    password: String!
  }

  input ProductoInput {
    nombre: String!
    existencia: Int!
    precio: Float!
  }

  input ClienteInput {
    nombre: String!
    apellido: String!
    empresa: String!
    email: String!
    telefono: String
  }

  type Query {
    #Users
    obtenerUsuario(token: String!): Usuario

    #Products
    obtenerProductos: [Producto]
    obtenerProducto(id: ID!): Producto

    #Customers
    obtenerClientes: [Cliente]
    obtenerClientesVendedor: [Cliente]
    obtenerCliente(id: ID!): Cliente
  }

  type Mutation {
    #Users
    nuevoUsuario(input: UsuarioInput): Usuario
    autenticarUsuario(input: AutenticarInput): Token

    #Products
    nuevoProducto(input: ProductoInput): Producto
    actualizarProducto(id: ID!, input: ProductoInput): Producto
    eliminarProducto(id: ID!): String

    #Customers
    nuevoCliente(input: ClienteInput): Cliente
    actualizarCliente(id: ID!, input: ClienteInput): Cliente
    eliminarCliente(id: ID!): String
  }
`;

module.exports = typeDefs;
