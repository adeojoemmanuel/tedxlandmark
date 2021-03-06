const Attendees = require("../Models/Attendees");
require("tls").DEFAULT_MIN_VERSION = "TLSv1";
const { transporter } = require("../Middlewares/mailer");
module.exports = class TicketController {
  static async create(request, response) {
    let { name, reg_no, email, ticket_no, amount } = request.body;
    if (!reg_no) {
      return response.json({ msg: "Reg_no required" });
    }
    if (!name || !email) {
      return response.json({ msg: "Name or email not provided" });
    }
    if (!ticket_no || !amount) {
      ticket_no = 1;
      amount = 1000;
    }
    try {
      const checkReg = await Attendees.findOne({ where: { reg_no } });
      if (checkReg) {
        return response.json({
          msg: "You've booked for a ticket before",
          error: true
        });
      }
    } catch (error) {
      return response.json({ msg: "Query error", error: false });
    }

    const mailData = {
      from: "tedxlandmarkuniversity@gmail.com",
      to: email,
      subject: "Ticket Booking",
      template: "index",
      context: {
        name,
        email,
        ticket_no,
        amount
      }
    };

    try {
      await transporter.sendMail(mailData);
    } catch (error) {
      return response.json({
        msg: `Couldn't send mail to ${email}`,
        error
      });
    }
    try {
      await Attendees.create({
        name,
        email,
        reg_no,
        amount,
        tickets: ticket_no
      });
      response.json({
        msg:
          "You've successfully booked for your ticket, check your webmail for further details",
        error: false
      });
    } catch (error) {
      response.json({ msg: "Query error", error: false });
    }
  }
};
