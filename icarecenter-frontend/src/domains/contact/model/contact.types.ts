export type ContactMessageInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  website: string;
};

export type ContactMessageResponse = {
  sent: true;
};
