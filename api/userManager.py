from passlib.hash import pbkdf2_sha256
import time
import urllib.request
import json
from os import sys
import random
import string
import os

def get_random_string(length):
    letters = string.ascii_lowercase
    result_str = ''.join(random.choice(letters) for i in range(length))
    return (result_str)


def createUser(username, password):
    if(password != None):
        with open('/home/moritzjenny/chickenBot/userData/users.txt', 'r+') as f:
            data = {}
            data = json.load(f)
            if (username not in data):
                user = {}
                salt = get_random_string(10)
                hash = pbkdf2_sha256.hash(password + salt)
                user["hash"] = hash
                user["salt"] = salt
                data[username] = user
                f.seek(0)
                f.truncate()
                json.dump(data, f)
                f.close()
                print("new user created OK!")
            else:
                print("username already exists!")
                f.close()
                return

    else:
        return

def authorize(password, something=0):
    if (password != None):
        with open('/home/moritzjenny/chickenBot/userData/users.txt', 'r+') as f:
            data = {}
            data = json.load(f)
            for d in data:
                salt = data[d]["salt"]
                hash = data[d]["hash"]
                if (pbkdf2_sha256.verify(password + salt, hash)):
                    f.close()
                    print("authorized OK!")
                    return "true"
                else:
                    continue
            f.close()
            print("password is wrong!")
            return ("password is wrong!")
    else:
        return False


def changePassword(username, oldPassword, newPassword):
    if (username != None and oldPassword != None and newPassword != None):
        with open('/home/moritzjenny/chickenBot/userData/users.txt', 'r+') as f:
            data = {}
            data = json.load(f)
            if (username in data):
                salt = data[username]["salt"]
                hash = data[username]["hash"]
                if (pbkdf2_sha256.verify(oldPassword + salt, hash)):
                    user = {}
                    salt = get_random_string(10)
                    hash = pbkdf2_sha256.hash(newPassword + salt)
                    user["hash"] = hash
                    user["salt"] = salt
                    user["email"] = data[username]["email"]
                    data[username] = user
                    f.seek(0)
                    f.truncate()
                    json.dump(data, f)
                    f.close()
                    print("changed password!")
                    return False
                else:
                    f.close()
                    print("old password is wrong!")
                    return False
            else:
                f.close()
                print("username does not exist!")
                return
    else:
        return



if __name__ == '__main__':
    globals()[sys.argv[1]](sys.argv[2], sys.argv[3])
