<?php

namespace AppBundle\Document\Repository;

use AppBundle\Document\JobStatus;

class JobRepository extends AbstractBaseDocumentRepository
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

    public function unassignWorkerJobs($workerId)
    {
        $this->collection->update(
            [
                'workerId' => $workerId,
            ],
            [
                '$unset' => [
                    'workerId' => ''
                ]
            ],
            [
                'multiple' => true
            ]
        );
    }

    /**
     * @param string $name
     * @param array $parameters
     *
     * @return \MongoId
     */
    public function createJob($name, array $parameters)
    {
        $job = [
            'name' => $name,
            'parameters' => $parameters,
            'status' => JobStatus::JOB_STATUS_NEW,
        ];

        $result = $this->collection->insert($job);

        if (!isset($result['ok']) || !$result['ok']) {
            return [
                'status' => 'error',
            ];
        }

        return [
            'status' => 'success',
            'result' => [
                'id' => $job['_id'],
            ],
        ];
    }

    public function updateJob($jobId, $update)
    {
        $result = $this->collection->update(
            [
                '_id' => new \MongoId($jobId),
            ],
            [
                '$set' => $update,
            ]
        );

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