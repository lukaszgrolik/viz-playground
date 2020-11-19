interface UpsertOpts<TSource, TBody> {
    find: (source: TSource, body: TBody) => boolean;
    mapInsert: (body: TBody) => TSource;
    onUpdate: (found: TSource, body: TBody) => void;
}

export function upsert<TSource, TBody>(itemArr: TSource[], bodyArr: TBody[] | undefined, opts: UpsertOpts<TSource, TBody>): void {
    if (!bodyArr || bodyArr.length === 0) return;

    const itemsToAdd: TSource[] = [];

    for (const body of bodyArr) {
        const found = itemArr.find(item => opts.find(item, body));
        if (found)
            opts.onUpdate(found, body);
        else
            itemsToAdd.push(opts.mapInsert(body));
    }

    itemArr.push(...itemsToAdd);
}