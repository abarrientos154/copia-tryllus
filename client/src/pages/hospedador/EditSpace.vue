<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary row items-center" style="width:100%; height:60px">
      <div class="col-1">
        <q-btn flat round color="white" icon="arrow_back" @click="$router.go(-1)"/>
      </div>
      <div class="col-10 text-white text-subtitle1 text-center">Editar espacio</div>
    </q-header>

    <q-page-container>
      <div class="q-pa-lg">
        <div class="q-pa-md">
          <div class="text-subtitle1">Carga las fotos de tu espacio de descanso</div>
          <div class="text-caption text-grey-10 text-italic">Puedes cargar hasta 3 fotos</div>
          <div class="row">
            <q-avatar v-if="mostrarImg.length < 3" rounded style="height: 100px; width: 100px; border-radius: 15px;" class="bg-grey q-my-xs q-mr-xs">
              <q-file  borderless :disable="espacioImg.length < 3 ? false : true" v-model="img" class="button-camera" @input="espacio_img()" accept=".jpg, image/*" style="z-index:1; width: 100%; height: 100%;"/>
              <q-icon name="backup" class="absolute-center" size="50px" color="white" />
            </q-avatar>
            <q-scroll-area horizontal class="col" style="height: 110px;">
              <div class="row no-wrap" style="width: 100%;">
                <q-avatar class="q-ma-xs" rounded v-for="(item, index) in mostrarImg" :key="index" style="height: 100px; width: 100px; border-radius: 15px;">
                  <q-img style="height: 100%;" :src="item">
                    <q-icon v-if="mostrarImg.length > 1" name="cancel" class="absolute-top-right q-ma-xs" size="25px" color="white" @click="editImg(index)"/>
                  </q-img>
                </q-avatar>
              </div>
            </q-scroll-area>
          </div>
        </div>

        <div class="row">
          <div class="col-xs-12 col-sm-6 col-md-6 col-lg-6 col-xl-6 q-mb-md">
            <div class="text-subtitle1 text-bold">Nombre para tu espacio</div>
            <div class="text-caption text-grey-10 text-italic">Solo 25 caracteres</div>
            <q-input dense filled v-model="form.name" placeholder="Nombre espacio" error-message="Este campo es requerido" :error="$v.form.name.$error" @blur="$v.form.name.$touch()"/>
          </div>
          <div class="col-xs-12 col-sm-6 col-md-6 col-lg-6 col-xl-6 q-mb-md">
            <div class="text-subtitle1 text-bold">¿Para quien estará disponible tu espacio?</div>
            <div class="text-caption text-grey-10 text-italic">Escoger perro, gato o ambos</div>
            <q-select dense filled option-value="name" option-label="name" v-model="form.pet_type" :options="mascotas" placeholder="tipos de mascotas" emit-value map-options error-message="Este campo es requerido" :error="$v.form.pet_type.$error" @blur="$v.form.pet_type.$touch()"/>
          </div>
          <div class="col-xs-12 col-sm-6 col-md-6 col-lg-6 col-xl-6 q-mb-md">
            <div class="text-subtitle1 text-bold">Tamaño de las mascotas que recives</div>
            <q-select dense filled placeholder="Tamaños" v-model="form.petSize" :options="['Pequeño', 'Mediano', 'Grande']" error-message="Este campo es requerido" :error="$v.form.petSize.$error" @blur="$v.form.petSize.$touch()"/>
          </div>
          <div class="col-xs-12 col-sm-6 col-md-6 col-lg-6 col-xl-6 q-mb-md">
            <div class="text-subtitle1 text-bold">Selecciona los servicios que incluye</div>
            <q-select dense filled option-value="name" option-label="name" v-model="servicios2" :options="servicios" @input="form.services = servicios2" placeholder="Servicios" multiple emit-value map-options error-message="Este campo es requerido" :error="$v.form.services.$error" @blur="$v.form.services.$touch()">
              <template v-slot:option="{ itemProps, itemEvents, opt, selected, toggleOption }">
                <q-item v-bind="itemProps" v-on="itemEvents">
                  <q-item-section>
                    <q-item-label v-html="opt.name" ></q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-checkbox :value="selected" @input="toggleOption(opt)" />
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
          <div class="col-xs-12 col-sm-6 col-md-6 col-lg-6 col-xl-6 q-mb-md">
            <div class="text-subtitle1 text-bold">Tipo de espacio</div>
            <q-select dense filled placeholder="" option-value="name" option-label="name" v-model="form.location" :options="location" emit-value map-options error-message="Este campo es requerido" :error="$v.form.location.$error" @blur="$v.form.location.$touch()"/>
          </div>
          <div class="col-xs-12 col-sm-6 col-md-6 col-lg-6 col-xl-6 q-mb-md">
            <div class="text-subtitle1 text-bold">Estado del espacio</div>
            <q-select dense filled placeholder="" option-value="name" option-label="name" v-model="form.state" :options="state" emit-value map-options error-message="Este campo es requerido" :error="$v.form.state.$error" @blur="$v.form.state.$touch()"/>
          </div>
        </div>

        <div>
          <div class="text-subtitle1 text-bold">Descripción del espacio</div>
          <div class="text-caption text-grey-10 text-italic">Solo 80 caracteres</div>
          <q-input filled outlined placeholder="Mi espacio es..." v-model="form.description" type="textarea" error-message="Este campo es requerido" :error="$v.form.description.$error" @blur="$v.form.description.$touch()"/>
        </div>

        <div>
          <div class="row items-center">
            <div class="text-subtitle1 text-bold col">Valor por noche</div>
            <div class=" col column">
              <div class="text-caption text-grey-10 text-italic" style="font-size: 11px">Ingresa el costo por noche</div>
              <q-input prefix="$" filled color="primary" v-model.number="form.price" type="number" dense :rules="[val => val > 0]" min="0" error-message="Este campo es requerido" :error="$v.form.price.$error" @blur="$v.form.price.$touch()"/>
            </div>
          </div>
          <div class="row items-center">
            <div class="text-subtitle1 text-bold col">Cantidad de huéspedes</div>
            <div class=" col column">
              <div class="text-caption text-grey-10 text-italic" style="font-size: 11px">Cantidad de huéspedes</div>
              <q-input filled color="primary" v-model.number="form.guests" type="number" dense :rules="[val => val > 0]" min="0" error-message="Este campo es requerido" :error="$v.form.guests.$error" @blur="$v.form.guests.$touch()"/>
            </div>
          </div>
          <div class="row items-center">
            <div class="text-subtitle1 text-bold col">Metros cuadrados</div>
            <div class=" col column">
              <div class="text-caption text-grey-10 text-italic" style="font-size: 11px">Cantidad de metros cuadrados</div>
              <q-input filled color="primary" v-model.number="form.dimensions" type="number" dense :rules="[val => val > 0]" min="0" error-message="Este campo es requerido" :error="$v.form.dimensions.$error" @blur="$v.form.dimensions.$touch()"/>
            </div>
          </div>
          <div class="row items-center">
            <div class="text-subtitle1 text-bold col"> El espacio es parte de un(a)</div>
            <div class=" col column">
              <div class="text-caption text-grey-10 text-italic" style="font-size: 11px">Seleccione el tipo de espacio</div>
              <q-select dense filled option-value="enable" option-label="name" v-model="form.only_pets" :options="only_pets" emit-value map-options error-message="Este campo es requerido" :error="$v.form.only_pets.$error" @blur="$v.form.only_pets.$touch()"/>
            </div>
          </div>
        </div>
        <div class="column items-center q-mt-xl">
          <q-btn color="primary" class="q-pa-xs" label="Guardar cambios" style="width: 60%; border-radius: 4px" @click="actualizar()" no-caps/>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script>
import { required, maxLength } from 'vuelidate/lib/validators'
import env from '../../env'
export default {
  data () {
    return {
      id: '',
      form: {},
      img: null,
      espacioImg: [],
      mostrarImg: [],
      index: [],
      servicios: [{ name: 'Paseo de mascota' }],
      servicios2: [],
      mascotas: [{ name: 'Perros' }, { name: 'Gatos' }, { name: 'Ambos' }],
      location: [{ name: 'Espacio compartido', description: 'Tu mascota se aloja en un espacio compartido con otros perros y gatos' }, { name: 'Espacio privado', description: 'Espacio habilitado para una sola mascota' }],
      state: [{ name: 'Disponible' }, { name: 'Ocupado' }, { name: 'Mantención' }],
      only_pets: [{ name: 'Hotel para mascotas' }, { name: 'Persona natural' }]
    }
  },
  validations: {
    form: {
      name: { required, maxLength: maxLength(25) },
      pet_type: { required },
      petSize: { required },
      services: { required },
      description: { required, maxLength: maxLength(80) },
      price: { required },
      guests: { required },
      dimensions: { required },
      only_pets: { required },
      location: { required },
      state: { required }
    }
  },
  mounted () {
    this.getHospedaje()
  },
  methods: {
    getHospedaje () {
      if (this.$route.params.id) {
        this.id = this.$route.params.id
        this.$api.get('hospedaje/' + this.id).then(res => {
          if (res) {
            this.form = res
            this.baseu = env.apiUrl + 'hospedajes_img/'
            this.servicios2 = this.form.services
            for (var i = 0; i <= this.form.images.length; i++) {
              this.mostrarImg.push(this.baseu + this.form.images[i].src)
            }
            delete this.form.datos_hospedador
          }
        })
      }
    },
    espacio_img () {
      this.espacioImg.push(this.img)
      this.mostrarImg.push(URL.createObjectURL(this.img))
      this.img = null
    },
    actualizar () {
      this.$v.$touch()
      if (!this.$v.form.$error) {
        this.$q.loading.show({
          message: 'Subiendo Espacio de Descanso, Por Favor Espere...'
        })
        var formData = new FormData()
        var idx = this.index.length
        var cantidadArchivos = this.espacioImg.length
        for (const j in this.espacioImg) {
          formData.append('files_' + j, this.espacioImg[j])
        }
        this.form.idx = idx
        this.form.cantidadArchivos = cantidadArchivos
        formData.append('dat', JSON.stringify(this.form))
        this.$api.put('hospedaje/' + this.id, formData, {
          headers: {
            'Content-Type': undefined
          }
        }).then((res) => {
          if (res) {
            this.$q.notify({
              message: 'Espacio de Descanso agregado con exito',
              color: 'positive'
            })
            this.$router.go(-1)
          }
          this.$q.loading.hide()
        })
      } else {
        this.$q.notify({
          message: 'Debe ingresar todos los datos correspondientes',
          color: 'negative'
        })
      }
    },
    editImg (idx) {
      this.mostrarImg.splice(idx, 1)
      this.index.push(idx)
      this.form.index = this.index
    }
  }
}
</script>
