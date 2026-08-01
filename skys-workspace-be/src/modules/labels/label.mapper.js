/**
 * @file label.mapper.js
 * @description Format Label entity sang Response DTO.
 */

const toLabelResponse = (lbl) => {
    if (!lbl) return null;

    return {
        id: lbl.id,
        name: lbl.name,
        color: lbl.color,
        projectId: lbl.project?.id || lbl.projectId,
        createdAt: lbl.createdAt
    };
};

const toLabelListResponse = (lbls) => {
    if (!Array.isArray(lbls)) return [];
    return lbls.map(toLabelResponse);
};

module.exports = {
    toLabelResponse,
    toLabelListResponse
};
