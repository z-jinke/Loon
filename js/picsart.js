let url = $request.url;
let body = $response.body;

if (/^https:\/\/api\.aidimension\.cn\/shop\/subscription\/apple\/purchases/.test(url)) {
    let obj = JSON.parse(body);
    obj.status = "success";
    obj.response = [{"status":"SUBSCRIPTION_PURCHASED","order_id":"490001314520000","original_order_id":"490001314520000","is_trial":true,"plan_meta":{"storage_limit_in_mb":20480,"frequency":"yearly","scope_id":"full","id":"com.picsart.editor.subscription_yearly","product_id":"subscription_yearly","level":2000,"auto_renew_product_id":"com.picsart.editor.subscription_yearly","type":"renewable","tier_id":"gold_old","permissions":["premium_tools_standard","premium_tools_ai"],"description":"china"},"limitation":{"max_count":5,"limits_exceeded":false},"reason":"ok","subscription_id":"com.picsart.editor.subscription_yearly","is_eligible_for_introductory":false,"purchase_date":1687020148000,"expire_date":4092599349000}];    
    body = JSON.stringify(obj);
}
$done({ body });
