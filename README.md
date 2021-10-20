# What you can do
  - Importing Simplnote that exported with JSON file

# What you can not do
  - Tags are unsupported
  - The created_time in simplenote can not import to notion's "created_time" property
    - Instead of the above, "Date" property is filled with created_time in Simplenote

# Restriction
  - This script follows Rate limit of Notion : 3 requests / seconds. 
  - Environment
    - PC(Ubuntu-20.04 on Windows10 WSL2)
    - node.js v12.22.6
    - npm 6.14.15
    - notionhq 0.1.9


# How To Use
  1. Export Simplenote json file from Settings(left upper icons on Web)
  2. Install node.js
  3. Download this script
  4. Put this script and the json file at the same directory
  5. Go to http://notion.so/my-integrations get api key
  6. At your notion, get database_id and invite your integrations

    $ export NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    $ export NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    $ npm install notionhq
    $ node simplenoteimporter.js