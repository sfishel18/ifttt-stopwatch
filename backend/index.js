const Firestore = require('@google-cloud/firestore');

const db = new Firestore({
  projectId: 'ifttt-stopwatch',
  keyFilename: './keyfile.json',
});

const directions = [
  "up",
  "down",
  "pause"
];

exports.update = (req, res) => {
  if (req.method === "HEAD") {
    res.status(200).send();
    return;
  }
  const { auth, direction, id } = req.body;
  if (auth !== process.env.AUTH_KEY) {
    res.status(401).send("Access denied");
    return;
  }
  if (!id) {
    res.status(400).send('Required argument "id" is missing or empty');
    return;
  }
  if (!directions.includes(direction)) {
    res.status(400).send('Required argument "direction" is missing or invalid');
    return;
  }

  //foo
  db.doc(`timers/${encodeURIComponent(id)}`).get()
    .then(snapshot => {
        const newState = { direction, lastUpdatedTime: Date.now(), previousValue: 0 };
        if (snapshot.exists) {
            const previousDirection = snapshot.get('direction');
            if (previousDirection === 'paused') {
              newState.previousValue = snapshot.get('previousValue')
            } else if (previousDirection === 'up') {
              newState.previousValue = snapshot.get('previousValue') + (newState.lastUpdatedTime - snapshot.get('lastUpdatedTime'))
            } else if (previousDirection === 'down') {
              newState.previousValue = snapshot.get('previousValue') - (newState.lastUpdatedTime - snapshot.get('lastUpdatedTime'))
            }
        }
        return db.doc(`timers/${encodeURIComponent(id)}`).set(newState)
    })
    .then(() => res.status(200).send('Updated successfully'))
    .catch(err => {
        console.error(err);
        res.status(400).send('Error during update')
    })
};

exports.get = (req, res) => {
  if (req.method === "HEAD") {
    res.status(200).send();
    return;
  }
  const { id } = req.query;
  if (!id) {
    res.status(400).send('Required argument "id" is missing or empty');
    return;
  }
  db.doc(`timers/${encodeURIComponent(id)}`).get()
    .then(snapshot => {
      if (!snapshot.exists) {
        return { direction: 'paused', previousValue: 0 }
      }
      return snapshot.data();
    })
    .then(payload => res.status(200).send(payload))
    .catch(err => {
        console.error(err);
        res.status(400).send({ error: err })
    })
};


exports.index = (req, res) => {
  switch (req.path) {
    case '/update':
      return exports.update(req, res)
    case '/get':
      return exports.get(req, res)
    default:
      res.send('function not defined')
  }
}
