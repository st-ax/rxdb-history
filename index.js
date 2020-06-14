export const DocumentHistory = {
    rxdb: true, // this must be true so rxdb knows that this is a rxdb-plugin and not a pouchdb-plugin
    /**
     * every value in this object can manipulate the prototype of the keynames class
     * You can manipulate every prototype in this list:
     * @link https://github.com/pubkey/rxdb/blob/master/src/plugin.ts#L22
     */
    prototypes: {
        /**
         * add a function to RxCollection so you can call 'myCollection.hello()'
         *
         * @param {object} prototype of RxCollection
         */
        RxDocument: (proto) => {
            proto.getHistoryMap = async function (doc) {
                let historyMapArray = []
                const changes = await doc.collection.pouch.get(doc.id, {
                  revs: true,
                  open_revs: 'all', // this allows me to also get the removed "docs"
                  revs_info: true, // Include a list of revisions of the document, and their availability.
                })
          
                if (changes.length && changes[0].ok && changes[0].ok._revisions) {
                  // console.log('ok._revisions :>> ', changes[0].ok._revisions)
                  let revStart = changes[0].ok._revisions.start
                  const revIDs = changes[0].ok._revisions.ids.map((eachRevID) =>
                    `${revStart--}-${eachRevID}`,
                  )
                  const revID = `${revIDs[revIDs.length - 1]}`
                  const docs = revIDs.map((eachRevID) => ({
                    id: doc.id,
                    rev: eachRevID,
                  }))
                  console.log(docs, 'fetching rev:', revID)
          
                  const res = await doc.collection.pouch.bulkGet({
                    docs,
                    revs: true,
                    include_docs: true,
                  })
                  console.log('res:', res)
          
                  historyMapArray = res.results.map((eachRes) => {
                    if (eachRes.docs && eachRes.docs[0].ok) {
                      const thisDoc = eachRes.docs[0].ok
                      const thisRev = thisDoc._rev.split('-')[0]
                      return [thisRev,thisDoc]
                    }
                  }).filter(keep=>!!keep)
                  console.log(historyMapArray)
                  console.log(
                    'oldest rev:',
                    historyMapArray[historyMapArray.length - 1][0],
                    historyMapArray[historyMapArray.length - 1][1].content,
                  )
                } else {
                  console.warn('change result not ok :>> ', changes)
                }
                return new Map(historyMapArray)
            }
        }
    },
    /**
     * some methods are static and can be overwritten in the overwriteable-object
     */
    overwritable: {
        validatePassword: function(password) {
            if (password && typeof password !== 'string' || password.length < 10)
                throw new TypeError('password is not valid');
        }
    },
    /**
     * you can add hooks to the hook-list
     */
    hooks: {
        /**
         * add a foo-property to each document. You can then call myDocument.foo (='bar')
         */
        createRxDocument: function(doc) {
            doc.foo = 'bar';
        }
    }
};