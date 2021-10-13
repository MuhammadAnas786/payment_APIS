require('dotenv').config();

export const mongodbURI =
  'mongodb+srv://admin:SkSVBflJ9Vbjopjw@cluster0.fgkjf.mongodb.net/crypto?retryWrites=true&w=majority';
export const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
  autoIndex: false,
  poolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
};
export const { SERVICE_PROVIDER_CODE,CALLBACK_HOST } = process.env;

