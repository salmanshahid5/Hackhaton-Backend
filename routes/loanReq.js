import express from "express";
import { loanRequest } from '../controllers/loanController.js';

const loanRoutes = express.Router();

loanRoutes.post('/loanrequest', loanRequest)
export default loanRoutes;