const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');
const Pedido = require('../models/Pedido');

const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'variables.env' });

const crearToken = (usuario, secret, expiresIn) => {
  const { id, email, nombre, apellido } = usuario;
  return jwt.sign({ id, email, nombre, apellido }, secret, { expiresIn });
};

const resolvers = {
  Query: {
    //Users
    obtenerUsuario: async (_, { token }) => {
      const usuarioId = await jwt.verify(token, process.env.SECRET);

      return usuarioId;
    },

    //Products
    obtenerProductos: async () => {
      try {
        const products = await Producto.find({});
        return products;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerProducto: async (_, { id }) => {
      try {
        const product = await Producto.findById(id);
        if (!product) {
          throw new Error('Producto no encontrado');
        }
        return product;
      } catch (error) {
        console.log(error);
      }
    },

    //Customers
    obtenerClientes: async () => {
      try {
        const clientes = await Cliente.find({});
        return clientes;
      } catch (error) {
        console.log(error);
      }
    },

    obtenerClientesVendedor: async (_, {}, ctx) => {
      try {
        const clientes = await Cliente.find({
          vendedor: ctx.usuario.id.toString(),
        });
        return clientes;
      } catch (error) {
        console.log(error);
      }
    },

    obtenerCliente: async (_, { id }, ctx) => {
      const cliente = await Cliente.findById(id);
      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }

      if (cliente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error('No tienes las credenciales');
      }

      return cliente;
    },

    //Purchases
    obtenerPedidos: async () => {
      try {
        const pedidos = await Pedido.find({});
        return pedidos;
      } catch (error) {
        console.log(error);
      }
    },

    obtenerPedidosVendedor: async (_, {}, ctx) => {
      try {
        const pedidos = await Pedido.findById({ vendedor: ctx.usuario.id });
        if (!pedidos) {
          throw new Error('Pedido no encontrado');
        }
        return pedidos;
      } catch (error) {
        console.log(error);
      }
    },
    
    obtenerPedido: async (_, { id }, ctx) => {
      const pedido = await Pedido.findById( id );
      if (!pedido) {
        throw new Error('Pedido no encontrado');
      }

      if (pedido.vendedor.toString() !== ctx.usuario.id) {
        throw new Error('No tienes las credenciales');
      }

      return pedido;

    },

  },

  Mutation: {
    //Users
    nuevoUsuario: async (_, { input }) => {
      console.log(input);

      const { email, password } = input;

      //Revisar si el usuario ya esta registrado
      const existeUsuario = await Usuario.findOne({ email });
      if (existeUsuario) {
        throw new Error('El usuario ya esta registrado');
      }

      //Hashear password
      const salt = await bcryptjs.genSalt(10);
      input.password = await bcryptjs.hash(password, salt);

      //Guardar en la base de datos
      try {
        const usuario = new Usuario(input);
        usuario.save();
        return usuario;
      } catch (error) {
        console.log(error);
      }

      return 'Creando ...';
    },

    autenticarUsuario: async (_, { input }) => {
      console.log(input);

      const { email, password } = input;

      //Revisar si el usuario esta registrado
      const existeUsuario = await Usuario.findOne({ email });
      if (!existeUsuario) {
        throw new Error('El usuario no esta registrado');
      }

      //Revisar si el password es correcto
      const passwordCorrecto = await bcryptjs.compare(
        password,
        existeUsuario.password
      );

      if (!passwordCorrecto) {
        throw new Error('El password no es correcto');
      }

      //Crear token

      return {
        token: crearToken(existeUsuario, process.env.SECRET, '24h'),
      };
    },

    //Products
    nuevoProducto: async (_, { input }) => {
      try {
        const producto = new Producto(input);
        const resultado = await producto.save();

        return resultado;
      } catch (error) {
        console.log(error);
      }
    },

    actualizarProducto: async (_, { id, input }) => {
      let producto = await Producto.findById(id);

      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      producto = await Producto.findByIdAndUpdate({ _id: id }, input, {
        new: true,
      });

      return producto;
    },

    eliminarProducto: async (_, { id }) => {
      let producto = await Producto.findById(id);

      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      await Producto.findByIdAndDelete({ _id: id });
      return 'Producto eliminado';
    },

    //Customers
    nuevoCliente: async (_, { input }, ctx) => {
      console.log(input);

      const { email } = input;

      //Verificar que exista el cliente
      const cliente = await Cliente.findOne({ email });
      if (cliente) {
        throw new Error('Ese cliente ya esta registrado');
      }

      const nuevoCliente = new Cliente(input);

      //Asignar vendedor
      nuevoCliente.vendedor = ctx.usuario.id;

      try {
        //Guardar cliente
        const resultado = await nuevoCliente.save();
        return resultado;
      } catch (error) {
        console.log(error);
      }
    },

    actualizarCliente: async (_, { id, input }, ctx) => {
      let cliente = await Cliente.findById(id);

      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }

      if (cliente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error('No tienes las credenciales');
      }

      cliente = await Cliente.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });

      return cliente;
    },

    eliminarCliente: async (_, { id }, ctx) => {
      let cliente = await Cliente.findById(id);

      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }

      if (cliente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error('No tienes las credenciales');
      }

      await Cliente.findByIdAndDelete({ _id: id });
      return 'Cliente eliminado';
    },

    //Purchases
    nuevoPedido: async (_, { input }, ctx) => {
      const { cliente } = input;

      //Verificar que exista el cliente
      const clienteExiste = await Cliente.findOne({ cliente });
      if (!clienteExiste) {
        throw new Error('Ese cliente no existe');
      }

      //Verificar si el cliente es del vendedor
      if (clienteExiste.vendedor.toString() !== ctx.usuario.id) {
        throw new Error('No tienes las credenciales');
      }

      //Verificar que el stock este disponible
      for await(const articulo of input.pedido){
        const { id } = articulo;
        const producto = await Producto.findById(id);

        if(articulo.cantidad > producto.existencia){
          throw new Error(`El articulo: ${producto.nombre} excede la cantidad disponible`);
        } else {
          //Restar cantidad a lo disponible
          producto.existencia = (producto.existencia - articulo.cantidad);
          await producto.save();
        }

      }

      //Crear un nuevo pedido
      const nuevoPedido = new Pedido(input);

      //Asignarle un vendedor
      nuevoPedido.vendedor = ctx.usuario.id;

      //Guardar en base de datos
      try {
        //Guardar cliente
        const resultado = await nuevoPedido.save();
        return resultado;
      } catch (error) {
        console.log(error);
      }
    },

    actualizarPedido: async (_, { id, input }, ctx) => {

      const { cliente } = input;

      //Verificar que exista el pedido
      const pedidoExiste = await Pedido.findOne( id );
      if (!pedidoExiste) {
        throw new Error('Ese pedido no existe');
      }

      //Verificar que exista el cliente
      const clienteExiste = await Cliente.findOne({ cliente });
      if (!clienteExiste) {
        throw new Error('Ese cliente no existe');
      }

      //Verificar si el cliente es del vendedor
      if (clienteExiste.vendedor.toString() !== ctx.usuario.id) {
        throw new Error('No tienes las credenciales');
      }

      if(input.pedido){
        //Verificar que el stock este disponible
        for await(const articulo of input.pedido){
          const { id } = articulo;
          const producto = await Producto.findById(id);

          if(articulo.cantidad > producto.existencia){
            throw new Error(`El articulo: ${producto.nombre} excede la cantidad disponible`);
          } else {
            //Restar cantidad a lo disponible
            producto.existencia = (producto.existencia - articulo.cantidad);
            await producto.save();
          }

        }
      }

      //Guardar en base de datos
      try {
        //Guardar cliente
        const resultado = await Pedido.findOneAndUpdate({ _id: id }, input, { new: true });
        return resultado;

      } catch (error) {
        console.log(error);
      }
    },

    eliminarPedido: async (_, { id }, ctx) => {
      //Verificar que exista el pedido
      const pedido = await Pedido.findOne( id );
      if (!pedido) {
        throw new Error('Ese pedido no existe');
      }

      //Verificar si el cliente es del vendedor
      if (pedido.vendedor.toString() !== ctx.usuario.id) {
        throw new Error('No tienes las credenciales');
      }

      await Pedido.findByIdAndDelete({ _id: id });
      return 'Pedido eliminado';
    },
  },
};

module.exports = resolvers;
