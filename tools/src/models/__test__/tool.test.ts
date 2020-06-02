import { Tool } from '../tool';

// the done in the async function parameters just tells jest that we are done if we return, handles an async possible issue
it('implements optimistic concurrency control', async (done) => {
    // create a tool instance
    const tool = Tool.build({
        title: 'tool1',
        category: 'cat',
        description: 'des',
        price: 10,
        address1: 'addr1',
        address2: 'addr2',
        city: 'city',
        region: 'region',
        zipcode: '12345',
        ownerId: 'ownerId'
    });

    // save the tool to the db
    await tool.save();
    
    // fetch the tool twice
    const firstInstance = await Tool.findById(tool.id);
    const secondInstance = await Tool.findById(tool.id);

    // make two separate changes, one to each tool
    firstInstance!.set({ price: 15});
    secondInstance!.set({ price: 9001});

    // save the first fetched tool
    await firstInstance!.save();


    // save the second fetched tool, this shouldn't work since the version field wasn't updated
    try {
        await secondInstance!.save();
    } catch (err) {
        // we are expecting an error, so just returning is what we want for the test
        return done();
    }

    throw new Error('Test should have failed by this point');
});

it('increments the version number on mulitple saves', async () => {
    const tool = Tool.build({
        title: 'tool1',
        category: 'cat',
        description: 'des',
        price: 10,
        address1: 'addr1',
        address2: 'addr2',
        city: 'city',
        region: 'region',
        zipcode: '12345',
        ownerId: 'ownerId'
    });

    await tool.save();

    expect(tool.version).toEqual(0);

    await tool.save();

    expect(tool.version).toEqual(1);

    for (let i: number = 0; i <= 3; i++) {
        await tool.save();
    }

    expect(tool.version).toEqual(5);
});