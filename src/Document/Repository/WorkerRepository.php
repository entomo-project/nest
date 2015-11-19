<?php

namespace AppBundle\Document\Repository;

class WorkerRepository extends AbstractBaseDocumentRepository
{
    /**
     * @param string $id
     *
     * @return array
     */
    public function findOneNoHydrate($id)
    {
        return $this->collection->findOne(
            [
                '_id' => new \MongoId($id),
            ]
        );
    }

    /**
     * @return array
     */
    public function findIdleNoHydrate()
    {
        $worker = $this->collection->findOne();

        if ($worker === null) {
            return;
        }

        $worker['ip'] = $worker['_id'];

        unset($worker['_id']);

        return $worker;
    }

    /**
     * @param string $ip
     *
     * @return \MongoId
     */
    public function registerWorker($ip) {
        $worker = [
            '_id' => $ip,
        ];

        $result = $this->collection->update($worker, $worker, [ 'upsert' => true, ]);

        if (!isset($result['ok']) || !$result['ok']) {
            return [
                'status' => 'error',
            ];
        }

        return [
            'status' => 'success',
        ];
    }

    /**
     * @param string $ip
     *
     * @return \MongoId
     */
    public function unregisterWorker($ip) {
        $worker = [
            '_id' => $ip,
        ];

        $result = $this->collection->remove($worker);

        if (!isset($result['ok']) || !$result['ok']) {
            return [
                'status' => 'error',
            ];
        }

        return [
            'status' => 'success',
        ];
    }
}