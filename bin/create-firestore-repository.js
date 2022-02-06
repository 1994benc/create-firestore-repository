#! /usr/bin/env node
const { execSync } = require("child_process");
const RESET = "\x1b[0m";
const GREEN = "\x1b[32m";
const WHITE = "\x1b[37m";
const RED = "\x1b[31m";

const getColoredText = (text, color) => {
  if (color == null) {
    color = WHITE;
  }
  return color + text + RESET;
};
// From https://stackoverflow.com/questions/2970525/converting-any-string-into-camel-case
function toCamelCase(str) {
  return str
    .replace(new RegExp("-", "g"), " ")
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
}

// From https://stackoverflow.com/questions/4068573/convert-string-to-pascal-case-aka-uppercamelcase-in-javascript
function toPascalCase(text) {
  return `${text}`
    .replace(new RegExp("-", "g"), " ")
    .replace(new RegExp(/[-_]+/, "g"), " ")
    .replace(new RegExp(/[^\w\s]/, "g"), "")
    .replace(
      new RegExp(/\s+(.)(\w*)/, "g"),
      ($1, $2, $3) => `${$2.toUpperCase() + $3.toLowerCase()}`
    )
    .replace(new RegExp(/\w/), (s) => s.toUpperCase());
}

const runCommand = (command) => {
  try {
    execSync(command, { stdio: "inherit" });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const args = process.argv.slice(2, process.argv.length);
const name = args[0];
const customFirestorePath = args[1];

if (!name) {
  console.error(
    getColoredText(
      `🙅 You must provide a name for the repository.
For example, npx create-firestore-repository user`,
      RED
    )
  );
  process.exit(1);
}

console.log(
  getColoredText(`Generating firestore repositories for ${name}...`, GREEN)
);

let folderName = `${name}`;
const namePlural = name + "s";

const pathToListFile =
  folderName + "/" + toCamelCase("use " + namePlural) + ".ts";
const modelName = toPascalCase(name + " Model");
const firestorePath = customFirestorePath || namePlural;
const pathToModelFile = folderName + "/" + modelName + ".ts";
const pathToSetFile = folderName + "/" + toCamelCase("set " + name) + ".ts";
const pathToGetFile = folderName + "/" + toCamelCase("use " + name) + ".ts";
const pathToDeleteFile =
  folderName + "/" + toCamelCase("delete " + name) + ".ts";

runCommand(`mkdir ${folderName}`);
runCommand(`touch ${pathToModelFile}`);
runCommand(`touch ${pathToSetFile}`);
runCommand(`touch ${pathToListFile}`);
runCommand(`touch ${pathToGetFile}`);
runCommand(`touch ${pathToDeleteFile}`);

// Create files' content

// Model file
runCommand(`echo "
    // TODO: implement the logic in this file
    export default class ${modelName} {
        constructor(
            public id: string,
        ) {}

        public static fromJSON(json: any): ${modelName} {
            return new ${modelName}(
                json.id,
            );
        }

        public toJSON(): any {
            return {
                id: this.id,
            };
        }
    }
" >> ${pathToModelFile}`);

// List file
runCommand(`echo "
// add your imports here. Remove any imports you don't need.
import { useState, useEffect } from 'react';
import ${modelName} from './${modelName}';
import { collection, onSnapshot, getFirestore } from 'firebase/firestore';


export default function ${toCamelCase("use " + namePlural)}() {
    const [data, setData] = useState<${modelName}[]>([]);
    
    useEffect(() => {
        const collectionRef = collection(getFirestore(), '${firestorePath}');
        const unsub = onSnapshot(collectionRef, (snapshot) => {
            const data = snapshot.docs.map((doc) => ${modelName}.fromJSON({
                ...doc.data(),
                id: doc.id,
            }));

            setData(data);
           
        });

        return () => {
            unsub();
        };
    }, []);

    return data;

}

" >> ${pathToListFile}`);

// Set file
runCommand(`echo "
// add your imports here. Remove any imports you don't need.
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import ${modelName} from './${modelName}';

export default async function ${toCamelCase(
  "set " + name
)}(data: ${modelName}): Promise<boolean> {
    try {
        const docRef = doc(getFirestore(), '${firestorePath}/' + data.id);
        await setDoc(docRef, data.toJSON(), { merge: true });
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

" >> ${pathToSetFile}`);

// Get file
runCommand(`echo "
// add your imports here. Remove any imports you don't need.
import { useState, useEffect } from 'react';
import ${modelName} from './${modelName}';
import { doc, onSnapshot, getFirestore } from 'firebase/firestore';


export default function ${toCamelCase("use " + name)}(id: string) {
    const [data, setData] = useState<${modelName}>();
    
    useEffect(() => {
        if (!id) {
            return;
        }
        const docRef = doc(getFirestore(), '${firestorePath}/' + id);
        const unsub = onSnapshot(docRef, (snapshot) => {
            const data = ${modelName}.fromJSON({
                ...snapshot.data(),
                id: snapshot.id,
            });

            setData(data);
            
        });

        return () => {
            unsub();
        };
    }, [id]);

    return data;

}

" >> ${pathToGetFile}`);

// Delete file
runCommand(`echo "
// add your imports here. Remove any imports you don't need.
import { doc, deleteDoc, getFirestore } from 'firebase/firestore';

export default async function ${toCamelCase(
  "delete " + name
)}(id: string): Promise<boolean> {
    try {
        const docRef = doc(getFirestore(), '${firestorePath}/' + id);
        await deleteDoc(docRef);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

" >> ${pathToDeleteFile}`);
