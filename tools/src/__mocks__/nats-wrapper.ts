export const natsWrapper = {
    client: {
        // publish: (subject: string, data: string, callback: () => void) => {
        //     // call the callback so that the promise gets instantly resolved in the text
        //     callback();
        // }
        publish: jest.fn().mockImplementation((subject: string, data: string, callback: () => void) => {
            callback();
        })
    }
};