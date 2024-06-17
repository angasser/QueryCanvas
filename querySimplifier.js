
export function simplifyQuery(state, view) {
    const queryLookup = new Map();
    for (const query of state.queries.values()) {
        queryLookup.set(query.id, queryLookup.size);
    }

    
}