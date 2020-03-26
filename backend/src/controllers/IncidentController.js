const connection = require('../database/connection');


module.exports = {
    async index(request,response){

        const { page = 1 } = request.query;

        const [count] = await connection('incidents').count();

        const incidents = await connection('incidents')
            .join('ongs','ongs.id', '=','incidents.ong_id')
            .limit(5)
            .offset((page - 1) * 5)
            .select(['incidents.*',
                'ongs.name',
                'ongs.email',
                'ongs.whatsapp',
                'ongs.city',
                'ongs.uf'
            ]);

        response.header('X-Total-Count',count['count(*)']);
        
       // return response.json({ola:'Ola'});
        return response.json(incidents);

    },

    async create(request,response){
        const {title, description, value} = request.body;
        const ong_id = request.headers.authorization;

        const [id] = await connection('incidents').insert({
            title,
            description,
            value,
            ong_id,
        });

        return response.json({ id });
    },

    async delete(request,response){
        console.log('ola1');
        const { id } = request.params;
        console.log('ola2');
        console.log(id);
        const ong_id = request.headers.authorization;
        console.log('ola3');
        console.log(ong_id);
        const incident = await connection('incidents')
        .where('id', id)
        .select('ong_id')
        .first();
        console.log('ola4');
        if(incident.ong_id !== ong_id){
            console.log('ola7');
            return response.status(401).json({error:'Operation not permitted.'});
        }
        console.log('ola5');
        await connection('incidents').where('id',id).delete();
        console.log('ola6');

        return response.status(204).send();
    } 

};