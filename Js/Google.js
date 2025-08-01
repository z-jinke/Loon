if (/^https:\/\/www\.google\.cn/.test($request.url)) {
  $done({
    response: {
      status: 302,
      headers: {
        Location: $request.url.replace("www.google.cn", "www.google.com")
      }
    }
  });
} else {
  $done({});
}
