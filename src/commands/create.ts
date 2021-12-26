import * as path from 'path'
import * as inquirer from 'inquirer'
import * as execa from 'execa'
import * as handlebars from 'handlebars'
import {
    chalk,
    fs,
    startSpinner,
    succeedSpiner,
    failSpinner,
    warn,
    info,
} from '../lib'

// 检查是否已经存在相同名字工程
const checkProjectExist = async (targetDir: string) => {
    if (fs.existsSync(targetDir)) {
        const answer = await inquirer.prompt({
            type: 'list',
            name: 'checkExist',
            message: `\n仓库路径${targetDir}已存在，请选择`,
            choices: ['覆盖', '取消'],
        })
        if (answer.checkExist === '覆盖') {
            warn(`删除${targetDir}...`)
            fs.removeSync(targetDir)
        } else {
            return true
        }
    }
    return false
}

const getQuestions = async (projectName: string) => {
    return await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: `package name: (${projectName})`,
            default: projectName,
        },
        {
            type: 'input',
            name: 'description',
            message: 'description',
        },
        {
            type: 'input',
            name: 'author',
            message: 'author',
        },
    ])
}

const cloneProject = async (targetDir: string, projectName: string, projectInfo: any) => {
    startSpinner(`开始创建仓库 ${chalk.cyan(targetDir)}`)
    // 复制'project-template'到目标路径下创建工程
    await fs.copy(
        path.join(__dirname, '..', '..', 'template'),
        targetDir
    )
    // handlebars模版引擎解析用户输入的信息存在package.json
    const jsonPath = `${targetDir}/package.json`
    const jsonContent = fs.readFileSync(jsonPath, 'utf-8')
    const jsonResult = handlebars.compile(jsonContent)(projectInfo)
    fs.writeFileSync(jsonPath, jsonResult)

    execa.commandSync('npm install', {
        stdio: 'inherit',
        cwd: targetDir,
    })

    succeedSpiner(
        `仓库创建完成 ${chalk.yellow(projectName)}\n👉 输入以下命令开启服务:`
    )

    info(`cd ${projectName}\nnpm run start\n`)
}

const action = async (projectName: string, cmdArgs: any) => {
    try {
        const targetDir = path.join(
            (cmdArgs && cmdArgs.context) || process.cwd(),
            projectName
        )
        console.log(targetDir)
        if (!(await checkProjectExist(targetDir))) {
            const projectInfo = await getQuestions(projectName)
            await cloneProject(targetDir, projectName, projectInfo)
        }
    } catch (e) {
        console.log(e)
    }
}
export default {
    command: 'create <project-name>',
    description: '创建一个模板工程',
    optionList: [['--context <context>', '上下文路径']],
    action,
}