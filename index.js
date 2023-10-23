//PRODUCTOS
const losProductos = [];
const baseUrl = "https://651e240844e393af2d5a8b45.mockapi.io";
const productos = document.querySelector(".productos");
//CARRITO
const carritoSelector = document.querySelector(".lista-carrito");
const carrito = [];
const total = document.querySelector("#total");
//FORMULARIO
const btnPagarCarrito = document.querySelector("#btnPagar");
const formPagar = document.querySelector("#formmularioPagar");

function tarjetas() {
  productos.innerHTML = "";

  losProductos.forEach((producto) => {
    productos.innerHTML += `
        <h2>Productos disponibles</h2>
        <div class="producto">
            <img src="${producto.imagen}" alt="Producto ">
            <h3>${producto.nombre}</h3>
            <p>Precio: $${producto.precio}</p>
            <button id="${producto.id}" class="agregar">Al Carrito</button>
        </div>
        `;
  });
}
document.addEventListener("click", (e) => {
  const btnAgregar = document.querySelectorAll(".agregar");
  const btnEliminar = document.querySelectorAll(".btnEliminar");
  btnAgregar.forEach((btn) => {
    if (e.target == btn) {
      const id = parseInt(e.target.id);
      const producto = losProductos.find((producto) => producto.id == id);
      agregarAlCarrito(producto);
    }
  });

  btnEliminar.forEach((btnBorrar) => {
    if (e.target == btnBorrar) {
      const id = e.target.id;
      eliminarDelCarrito(id);
      totalCarrito();
    }
  });
});

function totalCarrito() {
  const totalFinal = carrito.reduce(
    (acc, producto) => acc + producto.precio * producto.cantidad,
    0
  );
  total.innerHTML = totalFinal;
}

function buscarProducto(id, array) {
  const producto = array.find((producto) => producto.id == id);
  return producto;
}

function agregarAlCarrito(producto) {
  if (producto) {
    const productoEncontrado = buscarProducto(producto.id, carrito);
    if (productoEncontrado) {
      productoEncontrado.cantidad++;
    } else {
      carrito.push({
        ...producto,
        cantidad: 1,
      });
    }
    rederizarCarrito();
    totalCarrito();
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }
}

function eliminarDelCarrito(id) {
  const producto = buscarProducto(id, carrito);
  if (producto.cantidad > 1) {
    producto.cantidad--;
  } else {
    const index = carrito.indexOf(producto);
    carrito.splice(index, 1);
  }
  localStorage.setItem("carrito", JSON.stringify(carrito));
  rederizarCarrito();
}

function rederizarCarrito() {
  carritoSelector.innerHTML = "";
  carrito.forEach((producto) => {
    carritoSelector.innerHTML += `
        <li class="producto-carrito">${producto.nombre} - ${producto.precio} - Cantidad= ${producto.cantidad} <button id="${producto.id}" class="btnEliminar" ">X</button></li>
    `;
  });

  formPagar.innerHTML = `<form id="formDatos" >
  <input name="nombre" id="nombre type="text" placeholder="Nombre Completo">
  <input name="mail" id="mail type="email" placeholder="E-mail">
  <input name="direccion" id="direccion type="text" placeholder="Direccion">
  <input name="telefono" id="telefono type="text" placeholder="Telefono">
  <input type="text" class="inputProductos" name="productos" id="productos">
  <input id="btnFormulario" type="submit" value="Pagar">
  </form>
  `;
  const inputProductos = document.querySelector(".inputProductos");
  document.querySelector("#formDatos").addEventListener("submit", (e) => {
    e.preventDefault();

    const serviceID = "default_service";
    const templateID = "template_sz3bueb";

    carrito.forEach((producto) => {
      inputProductos.value += `${producto.nombre} - ${producto.cantidad} \n`;
    });

    Swal.fire({
      title: "¿Quieres confirmar la compra?",
      text: "Si cancelas, deberas empezar de nuevo!",
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, lo quiero!",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }).then((result) => {
      procesandoPago()
        .then((mensaje) => {
          Swal.fire("Finalizado!", mensaje.mensaje, "success");
          emailjs
            .sendForm(
              serviceID,
              templateID,
              document.querySelector("#formDatos")
            )
            .then(
              () => {
                Toastify({
                  text: "E-mail enviado correctamente",
                  duration: 3000,
                  close: true,
                  gravity: "top", // `top` or `bottom`
                  position: "right", // `left`, `center` or `right`
                  stopOnFocus: true, // Prevents dismissing of toast on hover
                  style: {
                    background: "linear-gradient(to right, #c2c2c2,#1c8bbf)",
                  },
                  onClick: function () {}, // Callback after click
                }).showToast();
              },
              (err) => {
                alert(JSON.stringify(err));
              }
            );
        })
        .catch((error) => {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error.mensaje,
            footer: '<a href="">Ayuda con este error</a>',
          });
        });
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await fetchAsync();
  tarjetas();
  const carritoParse = JSON.parse(localStorage.getItem("carrito")) || [];
  if (carritoParse.length > 0) {
    carritoParse.forEach((producto) => {
      carrito.push(producto);
    });
    rederizarCarrito();
    totalCarrito();
  } else {
    Toastify({
      text: "No hay productos en el carrito",
      duration: 3000,
      close: true,
      gravity: "top", // `top` or `bottom`
      position: "right", // `left`, `center` or `right`
      stopOnFocus: true, // Prevents dismissing of toast on hover
      style: {
        background: "linear-gradient(to right, #c2c2c2,#1c8bbf)",
      },
      onClick: function () {}, // Callback after click
    }).showToast();
  }
});

function procesandoPago() {
  const validarPago = Math.random() < 0.5;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (validarPago) {
        resolve({
          mensaje: "Pago realizado correctamente",
        });
      } else {
        reject({
          mensaje: "No se pudo realizar el pago",
        });
      }
    }, 5000);
  });
}
async function fetchAsync() {
  const resp = await fetch(
    "https://651e240844e393af2d5a8b45.mockapi.io/losProductos"
  );
  const data = await resp.json();
  data.forEach((producto) => {
    losProductos.push(producto);
  });
}
