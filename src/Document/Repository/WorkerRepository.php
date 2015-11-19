<?php

namespace AppBundle\Document\Repository;

class WorkerRepository extends AbstractBaseDocumentRepository
{
    /**
     * @param string $id
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