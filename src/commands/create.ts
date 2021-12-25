const action = (projectName) => {
    console.log('projectName:', projectName)
}
export default {
    command: 'create <registry-name>',
    description: '创建一个npm私服仓库',
    optionList: [['--context <context>', '上下文路径']],
    action,
}