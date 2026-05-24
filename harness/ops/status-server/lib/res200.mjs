export function res200(res, obj) {
  const buf = Buffer.from(JSON.stringify(obj), "utf-8");
  res.writeHead(200, { "Content-Type":"application/json","Content-Length":buf.length,"Access-Control-Allow-Origin":"*","Cache-Control":"no-store,no-cache" });
  res.end(buf);
}
