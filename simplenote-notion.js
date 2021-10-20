import fs from 'fs';
import { Client } from "@notionhq/client";
const jsonObject = JSON.parse(fs.readFileSync('./notes_sample.json', 'utf8'));
const activeNotes = jsonObject['activeNotes'];
const databaseId = process.env.NOTION_DATABASE_ID;
const notion = new Client({ auth: process.env.NOTION_API_KEY });
let limit = 50;

function createPageJson(databaseId, firstLine, creationDate, lastModified){
    console.log(creationDate);
    const body = {"parent": { "database_id": databaseId },
        "properties":{
            "Name":{
                "title":[{
                    "text":{
                        "content":firstLine
                    }
                }]
            },
            "Created": {
                "date": {
                    "start": creationDate
                },
            },
            "last_edited_time":{
                "title":[{
                    "text":{
                        "content":lastModified
                    }
                }]
            }
        }
    };
    return body;
}

function createBlockJson(PartialRestContent){
    let childFrame = {
        "children":[{
            "object":"block",
            "type":"paragraph",
            "paragraph":{
                "text":[]
            }}]}

    for(let j in PartialRestContent){
        let parag = {"type":"text", "text":{"content":PartialRestContent[j]+"\r\n"}}
        childFrame["children"][0]["paragraph"]["text"].push(parag)
        //console.log(childFrame["children"][0]["paragraph"]["text"])
    }
    return childFrame;
}    

async function createPageReq(body) {
    //console.log(body);
    try {
        console.log(body);
        const response = await notion.pages.create(body);
        //console.log(response);
        console.log("Success! Page added.");
        return response;
    }
    catch (error) {
        console.error(error.body);
        console.log("Error: Page can note create");
    }
}

async function createBlockReq(body) {
    //console.log(body);
    try {
        const response = await notion.blocks.children.append(body);
        console.log(response);
        console.log("Success! Blocks added.");
        return response;
    }
    catch (error) {
        console.error(error.body);
        console.log("Error: Blocks unable to add");
    }
}

// Sleep fucntion for rate limit
async function init() {
    console.log(1);
    await sleep(1000);
    console.log(2);
}

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}
// Sleep function end

(async () => {
for(let i in activeNotes){
    //parse activenotes in notes.json
    let stredJson = JSON.stringify(activeNotes[i]);
    const jsonNote = JSON.parse(stredJson);
    let creationDate = jsonNote["creationDate"];
    let lastModified = jsonNote["lastModified"];
    let allContent = jsonNote["content"];
    let firstLine = allContent.split('\r\n')[0];
    let restContent = allContent.split('\r\n').slice(1);

    // create json body of "page"
    let body = await createPageJson(databaseId, firstLine, creationDate, lastModified);

    // create Page. page_id is equal to block_id.
    let response = await createPageReq(body);
    //console.log('response');
    //console.log(response);
    //console.log('response end');
    let block_id = response["id"];
    //console.log(block_id);

    // create json body of "blocks"
    // restrict data size for API limit 
    let slicedContentSize = Math.floor(restContent.length / limit);
    console.log(slicedContentSize);
    // variable "limit" is a limit of content length.
    // Notion API can not accept over 100.
    // limit = 50 indicates half size of 100.
    for (let k=0; k <= slicedContentSize; k++){
        let child = []
        if (slicedContentSize == 0){
            child = restContent;
        }else if (slicedContentSize == k){  
            child = restContent.slice(k * limit);
            //console.log(firstLine);
            console.log(child);
        }
        else{
            child = restContent.slice(k * limit, (k+1) * limit);
        }
        
        let blockBody = createBlockJson(child);
        
        let newBody = Object.assign({"block_id":block_id}, blockBody);
        //console.log(newBody);
        await createBlockReq(newBody);

        // rate limit : 3 requests / seconds
        sleep(400);
        }
    }
})();





