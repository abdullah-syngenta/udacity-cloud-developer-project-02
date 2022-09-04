import express from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles } from './util/util';
const isImageURL = require('image-url-validator').default;

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  app.get("/filteredimage", async (req: express.Request, res: express.Response) => {
    try {
      if (req.query.image_url == undefined) {
        res.status(400).send({ 'message': 'Missing query param [image_url]' });
      }
      else {
        const isValidImage: boolean = await isImageURL(req.query.image_url);
        if (!isValidImage) {
          res.status(400).send({ 'message': 'Invalid Image, please provide a valid image url' });
        }
        else {
          let filteredImage: string = await filterImageFromURL(req.query.image_url) as string;
          res.sendFile(filteredImage, async (err) => {
            if (err) {
              console.log(err);
              res.sendStatus(500);
            }
            await deleteLocalFiles([filteredImage])
          });
        }

      }
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  });
  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}")
  });


  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();