<?php

namespace AppBundle\Controller;

use AppBundle\Manager\JobDescriptionManager;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class JobDescriptionController extends Controller
{
    public function createAction(Request $request)
    {
        $data = $request->request->get('data');

        $result = $this->getJobDescriptionManager()->createJobDescription($data['id'], $data['requirements']);

        return new JsonResponse($result);
    }

    public function retrieveAction($id)
    {
        $result = $this->getJobDescriptionManager()->retrieveJobDescription($id);

        return new JsonResponse($result);
    }

    public function updateAction($id, Request $request)
    {
        $data = $request->request->get('data');

        $result = $this->getJobDescriptionManager()->updateJobDescription($id, $data['requirements']);

        return new JsonResponse($result);
    }

    public function deleteAction($id)
    {
        $result = $this->getJobDescriptionManager()->deleteJobDescription($id);

        return new JsonResponse($result);
    }

    /**
     * @return JobDescriptionManager
     */
    protected function getJobDescriptionManager()
    {
        return $this->get('app.manager.job_description');
    }
}
