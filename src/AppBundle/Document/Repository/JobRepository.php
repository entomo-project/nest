<?php

namespace AppBundle\Document\Repository;

use AppBundle\Document\JobStatus;

class JobRepository extends AbstractBaseDocumentRepository
{
    /**
     * @param string $name
     * @param array $parameters
     *
     * @return \MongoId
     */
    public function createJob(
        $name,
        array $parameters
    ) {
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
}