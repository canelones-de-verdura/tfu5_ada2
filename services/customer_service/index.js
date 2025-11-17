import express from 'express'
import router from './presentation/router.js';

const app = express()
const port = 3000

app.disable("x-powered-by");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

app.listen(port, () => {
    console.log(`Service listening on port ${port}`)
})

