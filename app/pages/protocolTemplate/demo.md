# 账号

## 目录:

1. [普通登入](#doc-1)
2. [普通登陆并返回用户信息](#doc-2)
3. [获取用户单个饿单状态信息](#doc-3)
4. [普通登陆并返回用户信息](#doc-4)

<h3 id="doc-1">普通登入</h3>

#### 请求

`POST /login`

###### 请求服务类型
`SOA`

###### 请求参数描述
| 名字 | 类型 | 详细描述 |
| ----- | ----- | -------- |
| username | STRING | 用户名 |
| password | STRING | 密码 |
| captcha_code | STRING | 图片验证码 |

#### 响应

```
{
    'user_id': 1741148
}
```

<h3 id="doc-2">普通登陆并返回用户信息</h3>

#### 请求

`POST /login_for_user_info`

###### 请求服务类型
`HTTP`

###### 请求参数描述
| 名字 | 类型 | 详细描述 |
| ----- | ----- | -------- |
| username | STRING | 用户名 |
| password | STRING | 密码 |
| push_token | STRING | 可选参数 推送令牌 |
| captcha_code | STRING | 用户名密码输入错误一次后需要验证码 |

###### 响应样例

```
{
    "user_id": 1234,
    "avatar": "",
    "balance": 1.56,
    "current_address_id": 1,
    "current_invoice_id": 1,
    "email": "eleme@ele.me"
    "is_email_valid": true,
    "is_mobile_valid": true,
    "mobile": "13812345678",
    "payment_quota": 99,
    "point": 0,
    "username": "cjp",
    "referal_code": "abcde",
    "is_active": true,
    "gift_amount":84,
    "brand_member":true
}
```
###### 错误名

| 名字 | 详细描述 |
| ----- | -------- |
| USER_AUTH_FAIL | 用户名或者密码错误 |
| AUTH_FAIL_AND_CAPTCHA | 用户名或者密码错误并且下次需要验证码 |
| CAPTCHA_NONE_ERROR | 需要传递图片验证码 |
| CAPTCHA_CODE_ERROR | 图片验证码验证错误 |

<h3 id="doc-3">获取用户单个饿单状态信息</h3>

#### 请求
`GET /v2/users/{user_id}/orders/{v2_order_id}/status`

###### 请求服务类型
`SOA`

###### 请求参数描述
| 名字 | 类型 | 详细描述 |
| ----- | ---- | -------- |
| time | INT | 可选参数，送餐速度, 范围：5-120 |
| service | JSON | 可选参数，服务评价，结构详见字段例子 |
| order_items | JSON | 可选参数, 食物评价信息, 结构详见字段例子 |

####### service参数样例
```
{
    "value": 3 //服务打分, 3/2/1: 满意、一般般、不满意
    "text": "" //可为空
}
```

####### order_items参数样例
```
{
    "11111": {
        "value": 5, //1-5评分
        "text": "good"
    },
    "22222": {
        "value": 3,
        "text": "" //评价内容可为空
    }
}
```
#### 响应

##### 响应字段

| 名字 | 类型 | 详细描述 |
| ----- | ---- | -------- |
| title | STRING | 当前状态标题 |
| description | STRING | 当前状态描述 |
| rider_phone | STRING | 骑手电话电话 |
| diliver_station_phone | STRING | 配送站电话 |
| is_pay_valid | BOOL | 是否需要支付 |
| is_new_pay | BOOL | 是否使用新支付平台支付 |
| is_confirm_valid | BOOL | 是否可以确认送达 |
| confirm_title | STRING | 确认送达文案 |
| is_rider_valid | BOOL | 顶部状态是否显示骑手信息(位置和电话) |
| is_position_valid | BOOL | 骑手位置按钮是否可用 |
| is_cancelable | BOOL | 是否可以取消订单 |
| is_direct_cancelable | BOOL | 是否可以直接取消订单 |
| cancel_title | STRING | 取消订单文案 |
| direct_cancelable_disabled_reason | STRING | 订单不支持直接取消的原因 |
| is_rebuyable | BOOL | 是否支持再来一份 |
| rebuy_not_supported_reason | STRING | 不支持再来一份的原因 |
| is_eleme_service_enabled | BOOL | 是否可以申请客服介入 |
| eleme_service_title | STRING | 申请客服介入文案 |
| is_chargeback_enabled | BOOL | 是否可以申请退单 |
| chargeback_title | STRING | 申请退单文案 |
| chargeback_information | ARRAY | 申请退单详细信息 |
| is_refund_valid | BOOL | 是否可以退款 |
| is_cs_process | BOOL | 客服是否介入 |
| is_complained | BOOL | 是否已经投诉 |
| is_complaintable | BOOL | 是否可以投诉 |
| complaint_title | BOOL | 是否可以投诉 |
| pay_remain_time | INT | 支付剩余时间 |
| ad_url | STRING | 广告链接 |
| ad_enable | BOOL | 广告是否可用 |
| timeline | ARRAY | 简单timeline纪录 |
| share_hongbao_url | STRING | 支付后红包分享链接 |
| sns_share_hongbao_url | STRING | 详情页分享按钮红包分享链接 |
| ugc_info | ARRAY | UGC相关信息 |
| rate_status | INT | 评价状态，0:未评价，1:部分评价，2:全部评价 |
| timeline_detail_enabled | BOOL | 是否显示详细timeline |
| remind | OBJECT | 催单状态 |
| is_show_cancel_refund | BOOL | 不退了按钮是否显示 |
| pay_remain_seconds | int | 支付剩余时间(秒) |
| title_color | STRING | title颜色，即用来控制title文字颜色 |
| title_type | STRING | title类型，即用来控制title显示图标: arrive 订单送达;cancel_order 取消订单;completion_order 完成订单;customer_service 客服处理;distribution 配送;failed_pay 支付失败;payment 支付;restaurant 餐厅;restaurant_process 商家处理; |
| is_show_rebuy_button | BOOL | 是否显示再来一单按钮 |

###### timeline 字段

| 名字 | 类型 | 详细描述 |
| ----- | ---- | -------- |
| title | STRING | 状态标题 |
| status | STRING | record 的状态：not_performed 未进行; ongoing 正在进行; closed 已结束 |

###### chargeback_information.response 字段

| 名字 | 类型 | 详细描述 |
| ----- | ---- | -------- |
| code | STRING | 退单信息代码 |
| message | STRING | 退单描述 |

###### chargeback_information.online_chargeback 字段

| 名字 | 类型 | 详细描述 |
| ----- | ---- | -------- |
| online_chargeback | BOOL | 是否可以申请退款 |
| show_button | BOOL | 是否显示按钮 |
| enabled | BOOL | 按钮是否可用 |
| title | STRING | 按钮文案 |
| description | STRING | 描述信息 |

###### ugc_info 字段

| 名字 | 类型 | 详细描述 |
| ----- | ---- | -------- |
| is_rateable | BOOL | 是否可以评价 |
| rate_title | STRING | 点评美食文案 |
| image_upload_enabled | BOOL | 是否可以上传图片 |
| image_upload_title | STRING | 上传图片文案 |

######  remind字段

| 名字 | 类型 | 详细描述 |
| ----- | ---- | -------- |
| is_show | BOOL | 是否显示催单按钮 |
| status | INT | 催单状态，0:可催单; 1:不在催单允许时间内; 11:普通订单不在催单允许时间内; 12:预定订单不在催单允许时间内; 2:催单时间间隔小于10分钟; 3:催单次数大于3次; |
| contact | STRING | 当status=3，不为空; restaurant:联系餐厅; rider:骑手; station:配送站; |

###### 响应样例

```
{
    "title" : "等待餐厅接单",
    "description" : "预计送达:12分钟  已等待:20分钟",
    "rider_phone" : "",
    "diliver_station_phone" : "",
    "is_pay_valid" : false,
    "is_new_pay": true,
    "is_confirm_valid" : false,
    "confirm_title" : "确认",
    "is_rider_valid" : false,
    "is_position_valid : false,
    "is_cancelable" : true,
    "is_direct_cancelable" : true,
    "cancle_title" : "取消",
    "direct_cancelable_disabled_reason": "餐厅已做",
    "is_rebuyable" : true,
    "rebuy_not_supported_reason": "餐厅已关门，不支持点餐",
    "is_eleme_service_enabled" : true,
    "eleme_service_title": "申请客服介入",
    "is_chargeback_enabled" : true,
    "chargeback_title": "申请退单",
    "chargeback_information": {
        "response": {
            "code": "refund_expired",
            "message": "您已经错过了申请退单的时间段(支付24小时内)"
        }

    }
    "is_refund_valid" : false,
    "is_cs_process" : false,
    "is_complained" : false,
    "is_complaintable" : false,
    "complaint_title" : false,
    "refund_remain_time" : 0,
    "ad_url" : 'http://m.ele.me/sdfsdfsdfsd',
    "ad_enable" : true,
    "timeline" : [
        {
            "title": "订单已提交",
            "status": "closed",
        },
        {
            "title": "等待接单",
            "status": "ongoing",
        },
        {
            "title": "等待送达",
            "status": "not_performed",
        }
    ],
    "share_hongbao_url": "",
    "sns_share_hongbao_url": "",
    "ugc_info": {
        "is_rateable": false,
        "rate_title": "不可点评",
        "image_upload_enabled": false,
        "image_upload_title": "拍照已过期",
    },
    "rate_status": "1",
    "timeline_detail_enabled": false,
    "remind": {
        "is_show": true,
        "status": 3,
        "contact": "rider"
    }
    "is_show_cancel_refund": false,
    "pay_remain_seconds" : 0,
    "title_color" : 'grey2',
    "title_type" : 'restaurant',
    "is_show_rebuy_button" : false
}
```
###### 错误名

| 名字 | 详细描述 |
| ----- | -------- |
| GIFT_NOT_FOUND | 礼品不存在 |
| GIFT_REMAIN_NONE | 礼品已被兑换完 |
| POINT_NOT_ENOUGH | 用户积分不足 |

<h3 id="doc-4">普通登陆并返回用户信息</h3>

####请求

`POST /login_for_user_info_test`

###### 请求服务类型
`HTTP`

###### 请求参数描述
| 名字 | 类型 | 详细描述 |
| ----- | ----- | -------- |
| username | STRING | 用户名 |
| password | STRING | 密码 |
| push_token | STRING | 可选参数 推送令牌 |
| captcha_code | STRING | 用户名密码输入错误一次后需要验证码 |

#### 响应

##### 响应字段
| 名字 | 类型 | 详细描述 |
| ----- | ---- | -------- |
| title | STRING | 当前状态标题 |
| description | STRING | 当前状态描述 |
| rider_phone | STRING | 骑手电话电话 |
| diliver_station_phone | STRING | 配送站电话 |

###### 响应样例

```
{
    "user_id": 1234,
    "avatar": "",
    "balance": 1.56,
    "current_address_id": 1,
    "current_invoice_id": 1,
    "email": "eleme@ele.me",
    "is_email_valid": true,
    "is_mobile_valid": true,
    "mobile": "13812345678",
    "payment_quota": 99,
    "point": 0,
    "username": "cjp",
    "referal_code": "abcde",
    "is_active": true,
    "gift_amount":84,
    "brand_member":true
}
```
###### 错误名

| 名字 | 详细描述 |
| ----- | -------- |
| USER_AUTH_FAIL | 用户名或者密码错误 |
| AUTH_FAIL_AND_CAPTCHA | 用户名或者密码错误并且下次需要验证码 |
| CAPTCHA_NONE_ERROR | 需要传递图片验证码 |
| CAPTCHA_CODE_ERROR | 图片验证码验证错误 |
