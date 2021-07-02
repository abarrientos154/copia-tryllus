"use strict";

const Helpers = use('Helpers')
const mkdirp = use('mkdirp')
const fs = require('fs')
var randomize = require('randomatic');
const User = use("App/Models/User")
const Servicio = use("App/Models/Servicio")
const TiendaServicio = use("App/Models/TiendaServicio")
const Comentario = use('App/Models/Comentario')
const Role = use("App/Models/Role")
const { validate } = use("Validator")
const Pais = use("App/Models/Pais")
const Ciudad = use("App/Models/Ciudad")

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with users
 */
class UserController {
  /**
   * Show a list of all users.
   * GET users
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index({ request, response, view }) {
    let users = await User.all();
    response.send(users);
  }

  async show({ request, response, auth }) {
    user_id = ((await auth.getUser()).toJSON())._id
    let modelo = {
      accion: 'show',
      modelo: 'User',
      unique_key: { field: '_id', value: user_id }
    }
    let data = await Crud.crud(modelo)
    response.send(data)
  }

  /**
   * Create/save a new user.
   * POST users
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */

  async registerProveedor({ request, response }) {
      var dat = request.only(['dat'])
      dat = JSON.parse(dat.dat)
      const validation = await validate(dat, User.fieldValidationRulesProveedor())
      if (validation.fails()) {
        response.unprocessableEntity(validation.messages())
      } else if (((await User.where({email: dat.email}).fetch()).toJSON()).length) {
        response.unprocessableEntity([{
          message: 'Correo ya registrado en el sistema!'
        }])
      } else {
        let images_ident = []
        for (let i = 0; i < 2; i++) {
          let codeFile = randomize('Aa0', 30)
          const profilePic = request.file('IFiles' + i, {
            types: ['image']
          })
          if (Helpers.appRoot('storage/uploads/identificacionFiles')) {
            await profilePic.move(Helpers.appRoot('storage/uploads/identificacionFiles'), {
              name: codeFile,
              overwrite: true
            })
          } else {
            mkdirp.sync(`${__dirname}/storage/Excel`)
          }
          images_ident.push(profilePic.fileName)
        }

        let body = dat
        body.estatus = 0 // Estatus para verificacion del Proveedor
        body.roles = [3]
        body.images_ident = images_ident
        body.tienda.calificacion = 0
        const user = await User.create(body)

        const profilePic2 = request.file('PFiles', {
          types: ['image']
        })
        if (Helpers.appRoot('storage/uploads/tiendaFiles')) {
          await profilePic2.move(Helpers.appRoot('storage/uploads/tiendaFiles'), {
            name: user._id.toString(),
            overwrite: true
          })
        } else {
          mkdirp.sync(`${__dirname}/storage/Excel`)
        }

        const profilePic3 = request.file('RFiles', {
          types: ['image']
        })
        if (Helpers.appRoot('storage/uploads/perfil')) {
          await profilePic3.move(Helpers.appRoot('storage/uploads/perfil'), {
            name: user._id.toString(),
            overwrite: true
          })
        } else {
          mkdirp.sync(`${__dirname}/storage/Excel`)
        }
        const data = { name: profilePic3.fileName }
        response.send(user)
      }
  }

  async editProveedor({ request, response, auth }) {
    let user = (await auth.getUser()).toJSON()
    let body = request.all()
    delete body.tienda.country
    delete body.tienda.city
    let editar = await User.query().where('_id', user._id).update(body)
    response.send(editar)
  }

  async registerClient({ request, response }) {
      let dat = request.only(['dat'])
      dat = JSON.parse(dat.dat)
      console.log(dat, 'data')
      const validation = await validate(dat, User.fieldValidationRulesProveedor())
      if (validation.fails()) {
        response.unprocessableEntity(validation.messages())
      } else if (((await User.where({email: dat.email}).fetch()).toJSON()).length) {
        response.unprocessableEntity([{
          message: 'Correo ya registrado en el sistema!'
        }])
      } else {
        let body = dat
        const rol = 2 // Rol Cliente
        body.roles = [rol]
        const user = await User.create(body)
        const profilePic = request.file('perfilFile', {
          types: ['image']
        })
        if (Helpers.appRoot('storage/uploads/perfil')) {
          await profilePic.move(Helpers.appRoot('storage/uploads/perfil'), {
            name: user._id.toString(),
            overwrite: true
          })
        } else {
          mkdirp.sync(`${__dirname}/storage/Excel`)
        }
        const data = { name: profilePic.fileName }
        response.send(user)
      }
    }

  async registerHospedador({ request, response }) {
    var dat = request.only(['dat'])
    dat = JSON.parse(dat.dat)
    console.log(dat, 'DATA')
    const validation = await validate(dat, User.fieldValidationRulesProveedor())
    if (validation.fails()) {
      response.unprocessableEntity(validation.messages())
    } else if (((await User.where({email: dat.email}).fetch()).toJSON()).length) {
      response.unprocessableEntity([{
        message: 'Correo ya registrado en el sistema!'
      }])
    } else {
      let images = []
      for (let i = 0; i < 2; i++) {
        let codeFile = randomize('Aa0', 30)
        const profilePic = request.file('IFiles' + i, {
          types: ['image']
        })
        if (Helpers.appRoot('storage/uploads/identificacionFiles')) {
          await profilePic.move(Helpers.appRoot('storage/uploads/identificacionFiles'), {
            name: codeFile,
            overwrite: true
          })
        } else {
          mkdirp.sync(`${__dirname}/storage/Excel`)
        }
        images.push(profilePic.fileName)
      }
      let codeFile = randomize('Aa0', 30)
      const profilePic2 = request.file('PFiles', {
        types: ['image']
      })
      if (Helpers.appRoot('storage/uploads/hospedejeFiles')) {
        await profilePic2.move(Helpers.appRoot('storage/uploads/hospedajeFiles'), {
          name: codeFile,
          overwrite: true
        })
      } else {
        mkdirp.sync(`${__dirname}/storage/Excel`)
      }
      const image = { name: profilePic2.fileName }
      let body = dat
      const rol = 4 // Rol hospedador
      body.status = 0 // Estatus para verificacion del Proveedor
      body.roles = [rol]
      body.spaceFile = image
      body.identificationFiles = images
      const user = await User.create(body)
      const profilePic3 = request.file('RLFiles', {
        types: ['image']
      })
      if (Helpers.appRoot('storage/uploads/perfil')) {
        await profilePic3.move(Helpers.appRoot('storage/uploads/perfil'), {
          name: user._id.toString(),
          overwrite: true
        })
      } else {
        mkdirp.sync(`${__dirname}/storage/Excel`)
      }
      const data = { name: profilePic3.fileName }
      response.send(user)
    }
  }

  async editHospedador({ request, response }) {
    var dat = request.only(['dat'])
    dat = JSON.parse(dat.dat)
    console.log(dat, 'DATA')
    let images = dat.identificationFiles
    if (dat.IImg) {
      images = []
      for (let i = 0; i < 2; i++) {
        let codeFile = randomize('Aa0', 30)
        const profilePic = request.file('IFiles' + i, {
          types: ['image']
        })
        if (Helpers.appRoot('storage/uploads/identificacionFiles')) {
          await profilePic.move(Helpers.appRoot('storage/uploads/identificacionFiles'), {
            name: codeFile,
            overwrite: true
          })
        } else {
          mkdirp.sync(`${__dirname}/storage/Excel`)
        }
        images.push(profilePic.fileName)
      }
    }
    let image = dat.spaceFile
    if (dat.PImg) {
      let codeFile = randomize('Aa0', 30)
      const profilePic2 = request.file('PFiles', {
        types: ['image']
      })
      if (Helpers.appRoot('storage/uploads/hospedejeFiles')) {
        await profilePic2.move(Helpers.appRoot('storage/uploads/hospedajeFiles'), {
          name: codeFile,
          overwrite: true
        })
      } else {
        mkdirp.sync(`${__dirname}/storage/Excel`)
      }
      image = { name: profilePic2.fileName }
    }
    let body = dat
    let contraseña = body.password
    body.spaceFile = image
    body.identificationFiles = images
    if (body.RLImg) {
      const profilePic3 = request.file('RLFiles', {
        types: ['image']
      })
      if (Helpers.appRoot('storage/uploads/perfil')) {
        await profilePic3.move(Helpers.appRoot('storage/uploads/perfil'), {
          name: body._id.toString(),
          overwrite: true
        })
      } else {
        mkdirp.sync(`${__dirname}/storage/Excel`)
      }
      const data = { name: profilePic3.fileName }
    }
    delete body.RLImg
    delete body.PImg
    delete body.IImg
    delete body.password
    const user = await User.where('_id', body._id).update(body)
    response.send(user)
  }

  async validateEmail({ request, response, params }) {
    if (((await User.where({email: params.email}).fetch()).toJSON()).length) {
      response.unprocessableEntity([{
        message: 'Correo ya registrado en el sistema!',
        error: true
      }])
    } else {
      response.send({error: false})
    }
  }

  async allUser({ request, response, auth }) {
    let allUsers = (await User.query().where({}).fetch()).toJSON()
    let users = allUsers.filter(v => v.email !== 'admin@triyus.com')
    response.send(users)
  }

  async userLogueado({ request, response, auth }) {
    const user = (await auth.getUser()).toJSON()
    if (user.roles[0] === 3) {
      let country = await Pais.find(user.tienda.country_id)
      let city = await Ciudad.find(user.tienda.city_id)
      user.tienda.country = country
      user.tienda.city = city
    }
    response.send(user)
  }

  async userInfo({ request, response, auth }) {
    const user = (await auth.getUser()).toJSON()
    user.formatSer = []
    if (user.servicios) {
      for (let i of user.servicios) {
        let serv = await Servicio.findBy('id', i)
        user.formatSer.push(serv)
      }
    }
    let ciudad = ''
    let pais = ''
    if (user.ciudad_id && user.pais_id) {
      let objCiudad = await Ciudad.find(user.ciudad_id)
      ciudad = objCiudad.ciudad
      let objPais = await Pais.find(user.pais_id)
      pais = objPais.pais
    }
    user.paisName = pais
    user.ciudadName = ciudad
    let ciudadhotel = ''
    let paishotel = ''
    if (user.hoteleria.ciudad_id && user.hoteleria.pais_id) {
      let objCiudad = await Ciudad.find(user.hoteleria.ciudad_id)
      ciudadhotel = objCiudad.ciudad
      let objPais = await Pais.find(user.hoteleria.pais_id)
      paishotel = objPais.pais
    }
    user.hoteleria.paisName = paishotel
    user.hoteleria.ciudadName = ciudadhotel
    response.send(user)
  }

  async userById({ params, response }) {
    const user = await User.find(params.id)
    let ciudad = ''
    let pais = ''
    if (user.hoteleria.ciudad && user.hoteleria.pais_id) {
      let objCiudad = await Ciudad.find(user.hoteleria.ciudad)
      ciudad = objCiudad.ciudad
      let objPais = await Pais.find(user.hoteleria.pais_id)
      pais = objPais.pais
    }
    user.hoteleria.paisName = pais
    user.hoteleria.ciudadName = ciudad
    response.send(user)
  }
  async clientById({ params, response }) {
    const user = await User.find(params.id)
    user.country = await Pais.find(user.country_id)
    user.city = await Ciudad.find(user.city_id)
    response.send(user)
  }

  async tiendaById({ params, response }) {
    const user = (await User.query().where({_id: params.id}).first()).toJSON()
    let servicios = (await TiendaServicio.query().where({tienda_id: params.id}).with('servicio').fetch()).toJSON()
    let country = await Pais.find(user.tienda.country_id)
    let city = await Ciudad.find(user.tienda.city_id)
    user.tienda.servicios = servicios
    user.tienda.country = country
    user.tienda.city = city

    var cal = (await Comentario.query().where({tienda_id: params.id}).fetch()).toJSON()
    var total = 0
    if (cal.length) {
      cal.forEach(v => {
        total += v.calificacion
      })
      user.tienda.calificacion = (total / cal.length)
    } else {
      user.tienda.calificacion = total
    }
    response.send(user)
  }

  async hospedajeById({ params, response }) {
    const user = (await User.query().where({_id: params.id}).first()).toJSON()
    let country = await Pais.find(user.my_space.pais_id)
    let city = await Ciudad.find(user.my_space.ciudad_id)
    user.my_space.country = country
    user.my_space.city = city

    var cal = (await Comentario.query().where({tienda_id: params.id}).fetch()).toJSON()
    var total = 0
    if (cal.length) {
      cal.forEach(v => {
        total += v.calificacion
      })
      user.my_space.calificacion = (total / cal.length)
    } else {
      user.my_space.calificacion = total
    }
    response.send(user)
  }

  async userByRol({ request, params, response }) {
    try {
      let rol = request.all()
      const user = (await User.query().where({roles: rol.rol}).fetch()).toJSON()
      if (rol.rol[0] == 3) {
        for (let i in user) {
          user[i].city = (await Ciudad.find(user[i].tienda.city_id)).name
        }
      } else if (rol.rol[0] == 4) {
        for (let i in user) {
          user[i].city = (await Ciudad.find(user[i].my_space.ciudad_id)).name
          user[i].country = (await Pais.find(user[i].my_space.pais_id)).name
        }
      }
      response.send(user)
    } catch (error) {
      console.error('user by rol: ' + error.name + ':' + error.message)
    }
  }

  async userByStatus({ request, params, response }) {
    let rol = request.all()
    const user = (await User.query().where({roles: rol.rol, estatus: 0}).fetch()).toJSON()
    response.send(user)
  }

  async userByStatushotel({ request, params, response }) {
    let rol = request.all()
    const user = (await User.query().where({roles: rol.rol, estatusHotel: 0}).fetch()).toJSON()
    response.send(user)
  }

  async userEnable({ params, request, response }) {
    let dat = request.all()
    let modificar = await User.query().where('_id', params.id).update({enable: dat.enable})
    response.send(modificar)
  }

  async userStatus({ params, request, response }) {
    let dat = request.all()
    let modificar = await User.query().where('_id', params.id).update({estatus: dat.estatus})
    response.send(modificar)
  }

  async userStatushotel({ params, request, response }) {
    let dat = request.all()
    let modificar = await User.query().where('_id', params.id).update({estatusHotel: dat.estatusHotel})
    response.send(modificar)
  }

  async update({ request, response, params }) {
    let modelo = {
      accion: 'update',
      validar: {
        validar: true,
        datos: { name: 'string', last_name: 'string' }
      },
      modelo: 'User',
      autor: false,
      request: request.all(),
      requestOnly: request.only(['name', 'last_name']),
      unique_key: { field: '_id', value: (request.only(['_id']))._id }
    }
    let data = await Crud.crud(modelo)
    if (data.error) {
      response.unprocessableEntity([{
        message: data.msg
      }])
    } else { response.send(data) }
  }

  async destroy({ params, request, response }) {
    const { id } = params;
    const user = await User.find(id);
    await user.delete();
  }

  async login({ auth, request }) {
    const { email, password } = request.all();
    let token = await auth.attempt(email, password)
    const user = (await User.findBy('email', email)).toJSON()
    let isUser = false
    token.roles = user.roles.map(roleMap => {
      if (roleMap === 3) {
        isUser = true
      }
      return roleMap
    })
    let userRoles = await Role.whereIn('id', token.roles).fetch()
    let permissions = userRoles.toJSON()
    token.permissions = []
    permissions.forEach(element => {
      element.permissions.forEach(element2 => {
        token.permissions.push(element2)
      })
    })

    console.log(permissions, 'permissions')
    token.email = user.email
    token.estatus = user.estatus
    token.full_name = user.full_name ? user.full_name : null
    token.last_name = user.last_name
    let data = {}
    data.TRI_SESSION_INFO = token
    return data
  }

  showUser({ auth, params }) {
    if (auth.user.id !== Number(params.id)) {
      return "You cannot see someone else's profile";
    }
    return auth.user;
  }

    async userData({
      response,
      auth
    }) {
      let user = (await auth.getUser()).toJSON()
      for (let x = 0; x < user.roles.length; x++) {
        var s  = [user]
        const element = user.roles[x];
         if (element == 3) {
          /*  var s = await Country.query().where({
             _id: user.country
           }).with('user').fetch() */
         }
        if (element == 4) {
           var s = await Shop.query().where({
             user_id: user._id
           }).with('user').fetch()
        }
        if (element == 5) {
          var s = await Carrier.query().where({
            user_id: user._id
          }).with('user').fetch()
        }
      }
      response.send(s)
    }

    async updatedata ({ params, request, response }) {
      let body = request.only(User.fillablePerfil)
      let verificacion = body.cambioSoloClave
      let cambioClave = body.cambioClave
      let contraseña = body.password
      let cambiohotel = body.cambiohotel
      delete body.password
      delete body.cambioSoloClave
      delete body.cambioClave
      delete body.cambiohotel
      if (verificacion) {
        const editarcontraseña = await User.find(params.id)
        editarcontraseña.password = contraseña
        await editarcontraseña.save()
      } else {
        body.estatus = 0
        await User.query().where({_id: params.id}).update(body)

        if (!body.hoteleria) {
          let user = await User.find(params.id)
          if (user.hoteleria) {
            user.hoteleria = {}
            user.estatusHotel = 6
            await user.save()
          }
        }
        if (cambiohotel) {
          let user = await User.find(params.id)
          user.estatusHotel = 0
          await user.save()
        }

        if (cambioClave) {
          const editarcontraseña = await User.find(params.id)
          editarcontraseña.password = contraseña
          await editarcontraseña.save()
        }
      }
      response.send(body)
    }

}

module.exports = UserController;
