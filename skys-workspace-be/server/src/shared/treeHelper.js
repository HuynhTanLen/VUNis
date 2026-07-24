const buildProjectTree = (list) => {
    
    return list
    .filter(item => {
        const itemParentId = item.parentId ? item.parentId.ToString() : null;
        const targetParentId = parentId ? parentId.ToString() : null;
        return itemParentId == targetParentId
    })
    .map(item => ({
        ...item,
        children: buildProjectTree(list, item.id)
    }));
    
};

const sampleProjects = [
    { id: 1, name: "Dự án Cha A", parentId: null },
    { id: 2, name: "Dự án Cha B", parentId: null },
    { id: 3, name: "Dự án Con A.1", parentId: 1 },
    { id: 4, name: "Dự án Con A.2", parentId: 1 },
    { id: 5, name: "Dự án Cháu A.1.1", parentId: 3 }
];
console.log("=== KẾT QUẢ CÂY DỰ ÁN (ĐỆ QUY) ===");
console.log(JSON.stringify(buildProjectTree(sampleProjects), null, 2));
module.exports = { buildProjectTree };