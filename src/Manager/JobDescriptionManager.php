<?php

namespace AppBundle\Manager;

use AppBundle\Document\Repository\JobDescriptionRepository;

class JobDescriptionManager
{
    /**
     * @var JobDescriptionRepository
     */
    protected $jobDescriptionRepository;

    /**
     * @param JobDescriptionRepository $jobDescriptionRepository
     */
    public function __construct(JobDescriptionRepository $jobDescriptionRepository)
    {
        $this->jobDescriptionRepository = $jobDescriptionRepository;
    }

    /**
     * @param string $id
     */
    public function retrieveJobDescription($id)
    {
        $result = $this->jobDescriptionRepository->findOneNoHydrate($id);

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
     * @param string $id
     * @param array $requirements
     *
     * @return array
     */
    public function createJobDescription($id, array $requirements)
    {
        return $this->jobDescriptionRepository->createJobDescription($id, $requirements);
    }

    /**
     * @param string $id
     *
     * @return array
     */
    public function deleteJobDescription($id)
    {
        return $this->jobDescriptionRepository->deleteJobDescription($id);
    }

    /**
     * @param string $id
     * @param array $requirements
     *
     * @return array
     */
    public function updateJobDescription($id, array $requirements)
    {
        return $this->jobDescriptionRepository->updateJobDescription($id, $requirements);
    }
}