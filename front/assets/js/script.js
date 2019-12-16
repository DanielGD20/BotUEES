$(document).ready(function() {
  // Credentials
  var baseUrl =
    "https://us-central1-chatbotuees2019.cloudfunctions.net/dialogflowGateway";
  // var accessToken = "553ab6017e584e0fa351952c8c9ca95";

  //---------------------------------- Add dynamic html bot content(Widget style) ----------------------------
  // You can also add the html content in html page and still it will work!
  var mybot =
    '<div class="pruebaBoton" id="pruebas"><button type="button" class="btn btn-dark" id="regresar">Terminar Chat</button></div>' +
    '<div class="chatCont" id="chatCont">' +
    '<div id="result_div" class="resultDiv scrollbar scrollbar-lady-lips"></div>' +
    '<div class="chatForm" id="chat-div">' +
    '<div class="spinner">' +
    '<div class="bounce1"></div>' +
    '<div class="bounce2"></div>' +
    '<div class="bounce3"></div>' +
    "</div>" +
    '<input type="text" id="chat-entrada-usuario" autocomplete="off" placeholder="Escribe tu mensaje..."' +
    'class="form-control bot-txt"/>' +
    "</div>" +
    "</div><!--chatCont end-->" +
    '<div class="profile_div">' +
    '<div class="row">' +
    '<div class="col-hgt">' +
    '<div class="chat-txt">' +
    "Chatea con nosotros ahora!" +
    "</div>" +
    "</div><!--col-hgt end-->" +
    "</div><!--row end-->" +
    "</div><!--profile_div end-->";

  $("mybot").html(mybot);

  // ------------------------------------------ Esto se ejecuta al iniciar la app -----------------------------------------------

  var apiBot;

  $(".profile_div").toggle();
  $(".chatCont").toggle();
  $(".bot_profile").toggle();
  $(".chatForm").toggle();
  document.getElementById("chat-entrada-usuario").focus();

  saludo();

  var iframe = document.getElementById("robot");
  var uid = "56023ec5dafa4a59978d1ba512aa7e00";

  // Se llama al cliente
  var client = new Sketchfab(iframe);

  client.init(uid, {
    success: function onSuccess(api) {
      apiBot = api;
      apiBot.start();
      apiBot.load();
      apiBot.addEventListener("viewerready", function() {
        //Aqui se inserta el codigo de la api
        console.log("Esta listo");
        normal();
      });
    },
    error: function onError() {
      console.log("Error de carga");
    }
  });

  console.log($(".resultDiv").height());

  //-------------------------------------------- Fin del main -----------------------------------------------------------------

  $("#regresar").click(function() {
    location.assign("./index.html");
  });

  // Esto inicia la sesion, esto es importante ya que cada usuario debe tener una sesion unica--------------------------------
  var session = function() {
    // Obtienes el objeto del sessionStorage
    if (sessionStorage.getItem("session")) {
      var sesionRecuperada = sessionStorage.getItem("session");
    } else {
      // Genera un numero aleatorio
      var randomNo = Math.floor(Math.random() * 1000 + 1);
      // get obtiene la fecha
      var timestamp = Date.now();
      // obtiene el dia
      var date = new Date();
      var weekday = new Array(7);
      weekday[0] = "Sunday";
      weekday[1] = "Monday";
      weekday[2] = "Tuesday";
      weekday[3] = "Wednesday";
      weekday[4] = "Thursday";
      weekday[5] = "Friday";
      weekday[6] = "Saturday";
      //getDay() obtiene el numero del dia de la semana en el que se encuentra
      var day = weekday[date.getDay()];
      // mezcla el numero+dia+fecha y forma el id
      var session_id = randomNo + day + timestamp;
      // pone el objeto en el sesion storage
      sessionStorage.setItem("session", session_id);
      var sesionRecuperada = sessionStorage.getItem("session");
    }
    return sesionRecuperada;
    // console.log('session: ', sesionRecuperada);
  };

  // inicializa la sesion para el chat
  var mysession = session();

  // cuando se ingrese el texto dentro del cuadro------------------------------------------------------------------------------
  $("#chat-entrada-usuario").on("keyup keypress", function(e) {
    var keyCode = e.keyCode || e.which;
    //Se obtiene el texto del usuario
    var text = $("#chat-entrada-usuario").val();
    //keycode es el enter
    if (keyCode === 13) {
      if (text == "" || $.trim(text) == "") {
        e.preventDefault();
        return false;
      } else {
        $("#chat-entrada-usuario").blur();
        //llama a la funcion de response
        setUserResponse(text);
        //llama a la funcion de enviar el texto
        send(text);
        //hace que no sea vacio
        e.preventDefault();
        //retorna
        document.getElementById("chat-entrada-usuario").focus();
        return false;

        //falso
      }
    }
  });

  //------------------------------------------- Send request to API.AI ---------------------------------------
  function send(text) {
    var settings = {
      async: true,
      crossDomain: true,
      url:
        "https://us-central1-chatbotuees2019.cloudfunctions.net/dialogflowGateway",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
        "Cache-Control": "no-cache",
        "cache-control": "no-cache"
      },
      processData: false,
      data: `{\n\t"sessionId": "${mysession}",\n\t"queryInput": {\n\t\t"text": {\n\t\t\t"text": "${text}",\n\t\t\t"languageCode": "es"\n\t\t}\n\t}\n}`
    };

    $.ajax(settings).done(function(response) {
      main(response);
      console.log(response);
    });
  }

  //------------------------------------------- Main function ------------------------------------------------
  function main(data) {
    var sugerencias = false;
    var resultado = data.fulfillmentMessages[0].text.text[0];
    var action = "" + data.action;
    console.log(action);
    setBotResponse(resultado, action);
    if (sugerencias) {
      addSuggestion(sugerencias);
    }
  }

  //------------------------------------ pone la respuesta del bot en el chat -------------------------------------
  function setBotResponse(val, action) {
    console.log(action);
    setTimeout(function() {
      if ($.trim(val) == "") {
        val = "No pude obtener el resultado esperado, intenta otra cosa";
        var BotResponse =
          '<p class="botResult">' + val + '</p><div class="clearfix"></div>';
        $(BotResponse).appendTo("#result_div");
      } else {
        val = val.replace(new RegExp("\r?\n", "g"), "<br />");
        var BotResponse =
          '<p class="botResult">' + val + '</p><div class="clearfix"></div>';
        $(BotResponse).appendTo("#result_div");
      }

      switch (action) {
        case "input.unknown":
          scrollToBottomOfResults();
          hideSpinner();
          alerta();
          alturaChat();

        case "input.gracias":
          scrollToBottomOfResults();
          hideSpinner();
          love();
          alturaChat();

        default:
          scrollToBottomOfResults();
          hideSpinner();
          normal();
          alturaChat();
      }
    }, 500);
  }

  //------------------------------------- Pone la respuesta del usuario en el chat ------------------------------------
  function setUserResponse(val) {
    var UserResponse =
      '<p class="userEnteredText">' + val + '</p><div class="clearfix"></div>';
    $(UserResponse).appendTo("#result_div");
    $("#chat-entrada-usuario").val("");
    scrollToBottomOfResults();
    showSpinner();
    cargando();
    alturaChat();
    $(".suggestion").remove();
  }

  //---------------------------------- Scroll to the bottom of the results div -------------------------------
  function scrollToBottomOfResults() {
    var terminalResultsDiv = document.getElementById("result_div");
    terminalResultsDiv.scrollTop = terminalResultsDiv.scrollHeight;
  }

  //---------------------------------------- Spinner pensando ---------------------------------------------------
  function showSpinner() {
    $(".spinner").show();
  }
  function hideSpinner() {
    $(".spinner").hide();
  }

  function cargando() {
    apiBot.getAnimations(function(err, animations) {
      var firstAnimationUID = animations[1][0];
      apiBot.setCurrentAnimationByUID(firstAnimationUID);
    });
  }

  function normal() {
    apiBot.getAnimations(function(err, animations) {
      console.log(animations);
      var firstAnimationUID = animations[0][0];
      apiBot.setCurrentAnimationByUID(firstAnimationUID);
    });
  }

  function error() {
    apiBot.getAnimations(function(err, animations) {
      console.log(animations);
      var firstAnimationUID = animations[2][0];
      apiBot.setCurrentAnimationByUID(firstAnimationUID);
    });
  }

  function love() {
    apiBot.getAnimations(function(err, animations) {
      console.log(animations);
      var firstAnimationUID = animations[3][0];
      apiBot.setCurrentAnimationByUID(firstAnimationUID);
    });
  }

  function alerta() {
    apiBot.getAnimations(function(err, animations) {
      console.log(animations);
      var firstAnimationUID = animations[4][0];
      apiBot.setCurrentAnimationByUID(firstAnimationUID);
    });
  }

  function alturaChat() {
    var altura = $(".resultDiv").height();
    if (altura >= 561) {
      $(".resultDiv").css("height", "661");
    }
  }

  //------------------------------------------- Suggestions --------------------------------------------------
  function addSuggestion(textToAdd) {
    setTimeout(function() {
      var suggestions = textToAdd.replies;
      var suggLength = textToAdd.replies.length;
      $('<p class="suggestion"></p>').appendTo("#result_div");
      $('<div class="sugg-title">Suggestions: </div>').appendTo(".suggestion");
      // Loop through suggestions
      for (i = 0; i < suggLength; i++) {
        $('<span class="sugg-options">' + suggestions[i] + "</span>").appendTo(
          ".suggestion"
        );
      }
      scrollToBottomOfResults();
    }, 1000);
  }

  function saludo() {
    setTimeout(function() {
      showSpinner();

      setTimeout(function() {
        setBotResponse(
          "¡Hola!, Reciba un cordial saludo de parte de ChatBot UEES, En que podemos ayudarle."
        );
      }, 3000);
    }, 2000);
  }

  // on click of suggestions get value and send to API.AI
  $(document).on("click", ".suggestion span", function() {
    var text = this.innerText;
    setUserResponse(text);
    send(text);
    $(".suggestion").remove();
  });
  // Suggestions end -----------------------------------------------------------------------------------------
});
