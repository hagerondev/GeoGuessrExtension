import json
import time
from datetime import datetime, date
import boto3

def custom_dumps(o):
    if hasattr(o, '__iter__'):
        return list(o)
    elif isinstance(o, (datetime, date)):
        return o.isoformat()
    else:
        return str(o)

class Pub:
    def __init__(self):
        self.ws = boto3.client('apigatewaymanagementapi', endpoint_url="https://hqo6gpwt6k.execute-api.ap-northeast-1.amazonaws.com/production")
    
    def send(self,cid,content):
        try:
            self.ws.post_to_connection(ConnectionId=cid,Data=content)
            return True
        except:
            return False
    
    def send_all(self, cids, content):
        data = json.dumps(content,default=custom_dumps)
        deltar = []
        for cid in cids:
            if not self.send(cid, data):
                deltar.append(cid)
        return deltar
        

class DB:
    def __init__(self):
        self.db = boto3.resource("dynamodb")
        self.games = self.db.Table("GeoGuessrExtension-games")

    def get_game(self, gameID):
        return self.games.get_item(Key={"id":gameID}).get("Item",{})
    
    def add_user(self, gameID, userID, connectionId):
        option = {
            "Key": {"id": gameID},
            "UpdateExpression": "add #players :player, #connectionId :connectionId",
            "ExpressionAttributeNames": {
                "#players": "players",
                "#connectionId": "connectionId",
            },
            "ExpressionAttributeValues": {
                ":player": {userID},
                ":connectionId": {connectionId},
            },
            "ReturnValues": "ALL_NEW",
        }
        return self.games.update_item(**option)["Attributes"]
    
    def add_ready(self, gameID, userID):
        option = {
            "Key": {"id": gameID},
            "UpdateExpression": "add #ready :ready",
            "ExpressionAttributeNames": {
                "#ready": "ready",
            },
            "ExpressionAttributeValues": {
                ":ready": {userID}
            },
            "ReturnValues": "ALL_NEW",
        }
        return self.games.update_item(**option)["Attributes"]
        
    def update_ranking(self, gameID, ranking):
        option = {
            "Key": {"id": gameID},
            "UpdateExpression": "set #ranking = :ranking",
            "ExpressionAttributeNames": {
                "#ranking": "ranking",
            },
            "ExpressionAttributeValues": {
                ":ranking": ranking,
            },
            "ReturnValues": "ALL_NEW",
        }
        return self.games.update_item(**option)["Attributes"]

    def add_ranking(self, gameID, rankingMe):
        option = {
            "Key": {"id": gameID},
            "UpdateExpression": "add #rankingAll :rankingMe",
            "ExpressionAttributeNames": {
                "#rankingAll": "rankingAll",
            },
            "ExpressionAttributeValues": {
                ":rankingMe": {rankingMe},
            },
            "ReturnValues": "ALL_NEW",
        }
        return self.games.update_item(**option)["Attributes"]
    
    def update_gge(self, gameID, gge):
        now = int(time.time())
        ttl = now + 1*24*60*60
        option = {
            "Key": {"id": gameID},
            "UpdateExpression": "set #ttl = :ttl, #gge = :gge",
            "ExpressionAttributeNames": {
                "#ttl": "ttl",
                "#gge": "gge",
            },
            "ExpressionAttributeValues": {
                ":ttl": ttl,
                ":gge": gge
            }
        }
        self.games.update_item(**option)
    
    def remove_cids(self, gameID, tar):
        option = {
            "Key": {"id": gameID},
            "UpdateExpression": "delete #cids :cids",
            "ExpressionAttributeNames": {
                "#cids": "connectionId"
            },
            "ExpressionAttributeValues": {
                ":cids": set(tar)
            }
        }
        self.games.update_item(**option)
    
    def remove_ready(self, gameID):
        option = {
            "Key": {"id": gameID},
            "UpdateExpression": "set #ready = :ready",
            "ExpressionAttributeNames": {
                "#ready": "ready",
            },
            "ExpressionAttributeValues": {
                ":ready": {"_"},
            }
        }
        self.games.update_item(**option)


    def add_cid(self, gameID, connectionId):
        option = {
            "Key": {"id": gameID},
            "UpdateExpression": "add #connectionId :connectionId",
            "ExpressionAttributeNames": {
                "#connectionId": "connectionId",
            },
            "ExpressionAttributeValues": {
                ":connectionId": {connectionId},
            },
            "ReturnValues": "ALL_NEW",
        }
        return self.games.update_item(**option)["Attributes"]

    def update_mag(self, gameID, mag):
        option = {
            "Key": {"id": gameID},
            "UpdateExpression": "set #mag = :mag",
            "ExpressionAttributeNames": {
                "#mag": "timeMag",
            },
            "ExpressionAttributeValues": {
                ":mag": mag
            },
            "ReturnValues": "ALL_NEW",
        }
        return self.games.update_item(**option)["Attributes"]
        

def send_data(data):
    cids = data["connectionId"]
    if "connectionId" in data:
        del data["connectionId"]
    if "ttl" in data:
        del data["ttl"]
    if "rankingAll" in data:
        ranking = [json.loads(d) for d in data["rankingAll"]]
        for i in range(len(ranking)):
            ranking[i][2] = ranking[i][2].upper()
        print(ranking)
        ranking.sort(key=lambda x: (x[2],x[0],x[5],-x[4]))
        bname = "_"+ranking[0][2]
        rnd = 1
        for i in range(len(ranking)):
            if bname!=ranking[i][2]:
                rnd = 1
                bname = ranking[i][2]
            ranking[i][6] = rnd
            rnd += 1
        data["rankingAll"] = ranking
        print(ranking)
    deltar = pub.send_all(cids, data)
    if len(deltar)!=0:
        db.remove_cids(data["id"], deltar)
    

db = DB()
pub = Pub()

def action_prepare(data):
    action = data["action"]
    content = data["content"]
    if action=="join":
        res = db.add_user(content["gameID"], content["userID"], content["connectionId"])
    elif action=="ready":
        res = db.add_ready(content["gameID"],content["userID"])
    # if all are ready, next round
    ready = res.get("ready",set())
    ready.discard("_")
    players = res.get("players",set())
    isNext = len(ready)==len(players)
    if isNext:
        res["startTime"] = int(time.time())+2
        res["gge"] = 1
        db.remove_ready(content["gameID"])
    else:
        res["gge"] = 0

    send_data(res)

    # db.update_gge(content["gameID"],res["gge"])

def action_ranking(data):
    content = data["content"]
    action = data["action"]
    if action=="update":
        res = db.update_ranking(content["gameID"],content["ranking"])
        send_data(res)
    elif action=="updateMe":
        content["rankingMe"][0] = int(time.time())
        res = db.add_ranking(content["gameID"],json.dumps(content["rankingMe"]))
        send_data(res)

def action_result(data):
    content = data["content"]
    action = data["action"]
    if action=="get":
        res = db.add_cid(content["gameID"],content["connectionId"])
        send_data(res)

def action_settings(data):
    content = data["content"]
    action = data["action"]
    if action=="timeMag":
        res = db.update_mag(content["gameID"], content["timeMag"])
        send_data(res)


def do(data):
    state = data["body"]["state"]
    if state=="prepare":
        action_prepare(data["body"])
    elif state=="ranking":
        action_ranking(data["body"])
    elif state=="result":
        action_result(data["body"])
    elif state=="settings":
        action_settings(data["body"])

def lambda_handler(event, context):
    print(event)
    context = event["requestContext"]
    routeKey = context["routeKey"]
    data = {
        "routeKey": routeKey,
        "body": {"content":{}}
    }
    if routeKey=="$default":
        if type(event["body"])!=dict:
            data["body"] = json.loads(event["body"])
        else:
            data["body"] = event["body"]

        data["body"]["content"]["connectionId"] = context["connectionId"]
        do(data)
    
    # TODO implement
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
