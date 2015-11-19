<?php

namespace AppBundle\Manager;

use AppBundle\Document\Repository\JobRepository;

class JobManager
{
    /**
     * @var JobRepository
     */
    protected $jobRepository;

    /**
     * @param JobRepository $jobRepository
     */
    public function __construct(JobRepository $jobRepository)
    {
        $this->jobRepository = $jobRepository;
    }

    /**
     * @param string $id
     */
    public function retrieveJob($id)
    {
        $result = $this->jobRepository->findOneNoHydrate($id);

        if ($result === null) {
            return [
                'status' => 'not_found',
            ];
        }

        $result['id'] = (string)$result['_id'];

        unset($result['_id']);

        return [
            'status' => 'success',
            'result' => $result,
        ];
    }

    /**
     * @param string $name
     * @param array $parameters
     *
     * @return array
     */
    public function createJob($name, array $parameters)
    {
        return $this->jobRepository->createJob($name, $parameters);
    }
}