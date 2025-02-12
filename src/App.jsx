import React, { useEffect, useState } from "react";
import "jsoneditor/dist/jsoneditor.css";
import "@arco-design/web-react/dist/css/arco.css";
import { Button, Input, Space, Message, Tabs, Table, Radio, Modal } from "@arco-design/web-react";
import { writeTextFile, BaseDirectory, readTextFile, exists, create, mkdir } from '@tauri-apps/plugin-fs';
import { IconSave, IconImport, IconFire, IconAlignLeft, IconRefresh, IconAlignRight, IconCopy } from "@arco-design/web-react/icon";
import JSONEditor from 'jsoneditor';
import dayjs from "dayjs";
import { save, open } from '@tauri-apps/plugin-dialog';
import invoke from "@/util/invoke";
import jsonToGo from "@/util/json-to-go";
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
const TabPane = Tabs.TabPane;
var getCurrent = async () => {
    try {
        let value = await readTextFile('current.json', { baseDir: BaseDirectory.AppData });
        return value
    } catch (e) {
        return '{}'
    }
}
var setCurrent = async (value) => {
    try {
        console.log("setCurrent", value)
        let dirExists = await exists('', {
            baseDir: BaseDirectory.AppData,
        });
        if (!dirExists) {
            await mkdir('', { baseDir: BaseDirectory.AppData });
        }
        let fileExists = await exists('current.json', {
            baseDir: BaseDirectory.AppData,
        });
        if (!fileExists) {
            let result = await create('current.json', { baseDir: BaseDirectory.AppData });
        }
        return await writeTextFile('current.json', value, { baseDir: BaseDirectory.AppData });
    } catch (e) {
        console.log(e)
        return false;
    }
}

var getJsonHeight = () => {
    return document.documentElement.clientHeight - 70
}

const columns = [
    {
        title: 'Name',
        dataIndex: 'name',
    },
    {
        title: 'Salary',
        dataIndex: 'salary',
    },
    {
        title: 'Address',
        dataIndex: 'address',
    },
    {
        title: 'Email',
        dataIndex: 'email',
    },
];
const data = [
    {
        key: '1',
        name: 'Jane Doe',
        salary: 23000,
        address: '32 Park Road, London',
        email: 'jane.doe@example.com',
    },
    {
        key: '2',
        name: 'Alisa Ross',
        salary: 25000,
        address: '35 Park Road, London',
        email: 'alisa.ross@example.com',
    },
    {
        key: '3',
        name: 'Kevin Sandra',
        salary: 22000,
        address: '31 Park Road, London',
        email: 'kevin.sandra@example.com',
    },
    {
        key: '4',
        name: 'Ed Hellen',
        salary: 17000,
        address: '42 Park Road, London',
        email: 'ed.hellen@example.com',
    },
    {
        key: '5',
        name: 'William Smith',
        salary: 27000,
        address: '62 Park Road, London',
        email: 'william.smith@example.com',
    },
];


var editor = null;
function App1() {
    const [jsonHeight, setJsonHeight] = useState(400)

    useEffect(() => {
    }, [])




    var copy = () => {
        let text = editor.getText()
        writeText(text).then(() => {
            Message.success("复制成功")
        })
    }
    return <div style={{ padding: '10px' }}>

        <Modal>
            <Input style={{ width: '50%', marginBottom: '10px' }} allowClear placeholder='检索' />
        </Modal>
        <Radio.Group defaultValue={'Beijing'} name='button-radio-group' style={{ margin: '10px auto', textAlign: 'center', display: 'block' }}>
            {['全部', '下载目录', 'Guangzhou'].map((item) => {
                return (
                    <Radio key={item} value={item}>
                        {({ checked }) => {
                            return (
                                <Button tabIndex={-1} key={item} type={checked ? 'primary' : 'default'}>
                                    {item}
                                </Button>
                            );
                        }}
                    </Radio>
                );
            })}
        </Radio.Group>
        <Table columns={columns} data={data} pagination={false} />
    </div>
}

export default App1
