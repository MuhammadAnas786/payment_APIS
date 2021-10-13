export const response = (res, status, body) => {
  res.status(status).json(body);
};

export const responseXml = (res, status, body) => {
  res.set("Content-Type", "text/xml");
  res.status(status);
  res.send(body);
};
