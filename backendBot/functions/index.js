const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });
const admin = require("firebase-admin");
const serviceAccount = require("./service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://chatbotuees2019.firebaseio.com"
});

const { SessionsClient } = require("dialogflow");

exports.dialogFlowGateway = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    const { queryInput, sessionId } = request.body;

    //hace la peticion de las credenciales del cliente
    const sessionClient = new SessionsClient({ credentials: serviceAccount });
    //una vez hecha la peticion guarda los valores de el proyecto
    const session = sessionClient.sessionPath("chatbotUEES2019", sessionId);

    //Espera a que se reciba un intent donde se recibira el input o lo que quiere decir el usuario
    const responses = await sessionClient.detectIntent({ session, queryInput });

    //Se guarda el resultado dentro de la variable result
    const result = responses[0].queryResult;

    //se envia como response el resultado de dicha peticion
    response.send(result);
  });
});

const { WebhookClient } = require("dialogflow-fulfillment");

exports.dialogflowWebhook = functions.https.onRequest(
  async (request, response) => {
    //Se obtiene el valor del agente
    const agent = new WebhookClient({ request, response });

    //se obtiene el resultado de la peticion al agente converzacional
    const result = request.body.queryResult;

    //Aqui se hacen las cosas correspondientes a la base de datos, firebase
    //-------------------------------------------------------------------------------
    async function userOnboardingHandler(agent) {
      //Esto inicializa la base de datos de firebase
      const db = admin.firestore;

      //Esto obtiene un usuario dentro de la base de datos
      const profile = db.CollectionReference("users").doc("jeffd23");

      //obtiene los resultados del query antes enviado dentro del agente converzacional
      const { name, color } = result.parameters;

      await profile.set({ name, color });
      agent.add("welcome aboard my friend");
    }
    //----------------------------------------------------------------------------------

    let intentMap = new Map();
    intentMap.set("UserOnboarding", userOnboardingHandler);
    agent.handleRequest(intentMap);
  }
);
