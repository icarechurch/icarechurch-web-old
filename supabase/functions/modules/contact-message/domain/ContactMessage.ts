export type ContactMessage = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

export class ContactValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContactValidationError";
  }
}

export class ContactDeliveryError extends Error {
  constructor() {
    super("Unable to deliver contact message");
    this.name = "ContactDeliveryError";
  }
}
