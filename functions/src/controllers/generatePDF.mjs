import * as functions from "firebase-functions";
import HttpStatusCodes from "../declarations/HttpStatusCodes.mjs";
import firebaseAdmin from "../services/firebase-admin.mjs";
import { generatePDFBody } from "../validations/generatePDF.mjs";
import PDFGenerator from "pdfkit";
import nodemailer from "nodemailer";

/**
 * @param {IReq} req
 * @param {IRes} res
 * @param {NextFunction} next
 */
export async function generatePDF(req, res, next) {
  try {
    const { body } = req;
    await generatePDFBody.validate(body);

    const { UserId, Email } = body;

    const user = await firebaseAdmin.getUserDocument(UserId);

    const { customerID, name } = user.data();

    if (!user.exists) {
      res.status(HttpStatusCodes.NOT_FOUND).send("User does not exist");
      return;
    }

    const pdf = new PDFGenerator();

    const generate = async () => {
      const buffers = [];

      pdf.on("data", buffers.push.bind(buffers));
      pdf.on("end", async () => {
        const pdfData = Buffer.concat(buffers);
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          service: "gmail",
          auth: {
            user: "application.dev.acc.01@gmail.com",
            pass: "jckzbphfdtkbffgg",
          },
        });

        // send mail with defined transport object
        const info = await transporter.sendMail({
          from: "application.dev.acc.01@gmail.com", // sender address
          to: Email, // list of receivers
          subject: "Hello ✔", // Subject line
          text: "Hello world?", // plain text body
          attachments: [
            {
              filename: `donations-${customerID}.pdf`,
              content: pdfData,
            },
          ],
        });

        console.log("Message sent: %s", info.response);
      });

      pdf
        .text("End of year donation letter:", 100, 150)
        .moveDown()
        .text(`Date: ${new Date(Date.now())}`)
        .moveDown()
        .text(`Dear ${name},`)
        .moveDown()
        .text(
          `Thank you for your donation(s) of $<TOTAL_DONATION_AMOUNT> through Lasting Change Inc. between the dates of 1/1/2022-12/31/2022. As you may know, Lasting Change Inc. was organized to support other 501(c)(3) organizations on behalf of our donors.`
        )
        .moveDown()
        .text(
          `CHARITY_NAME CHARITY_EIN AMOUNT_DONATED
      `
        )
        .moveDown()
        .text(
          `Lasting Chance Inc. is a 501(c)(3) organization. Your contribution is tax deductible to the extent allowed by the law. No goods or services were provided in exchange for your generous donations.
      `
        )
        .moveDown()
        .text(
          `Again, thank you for your support.
      `
        )
        .moveDown()
        .text(`Sincerely`)
        .moveDown()
        .text(
          `Lasting Change Inc.
      `
        )
        .moveDown()
        .text(`EIN: 86-1995653`)
        .end();
    };

    generate();

    res.status(HttpStatusCodes.OK).send(`Email sent to ${Email}`);
  } catch (error) {
    functions.logger.error(error, { structuredData: true });
    next(error);
  }
}
