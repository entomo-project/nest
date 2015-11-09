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