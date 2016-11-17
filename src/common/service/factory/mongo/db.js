import mongo from 'mongodb'

export default function (conf) {
  const url = 'mongodb://'
    + conf.host
    + ':'
    + conf.port
    + '/'
    + conf.database

  return mongo.connect(url)
}
