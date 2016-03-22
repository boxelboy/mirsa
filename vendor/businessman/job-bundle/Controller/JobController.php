<?php
namespace BusinessMan\Bundle\JobBundle\Controller;

use BusinessMan\Bundle\JobBundle\Form\Type\ChildJobType;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use BusinessMan\Bundle\JobBundle\Entity\Job;
use Symfony\Component\HttpFoundation\Request;

/**
 * JobController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/JobBundle
 */
class JobController extends Controller
{
    /**
     * List all jobs
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400, vary={"Cookie"})
     * @Security("has_role('ROLE_STAFF')")
     */
    public function listAction()
    {
        return $this->render('BusinessManJobBundle:Job:list.html.twig');
    }

    /**
     * List jobs to which the logged in user is assigned
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400, vary={"Cookie"})
     * @Security("has_role('ROLE_STAFF')")
     */
    public function listOwnAction()
    {
        return $this->render('BusinessManJobBundle:Job:listOwn.html.twig');
    }

    /**
     * View a job's details
     *
     * @param Job $job
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=60, maxage=60, lastModified="job.getLastModified()", vary={"Cookie"})
     * @Security("has_role('ROLE_STAFF')")
     */
    public function viewAction(Job $job)
    {
        $isResource = $this->getDoctrine()->getRepository('BusinessManJobBundle:Job')
            ->createQueryBuilder('j')
            ->select('COUNT(a.id)')
            ->innerJoin('j.assignments', 'a')
            ->andWhere('a.resource = :resource')
            ->andWhere('j.id = :job')
            ->setParameter('resource', $this->getUser()->getStaff()->getResource())
            ->setParameter('job', $job)
            ->getQuery()
            ->getSingleScalarResult();

        return $this->render(
            'BusinessManJobBundle:Job:view.html.twig',
            array('job' => $job, 'isResource' => $isResource)
        );
    }

    /**
     * Create a child job
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400, vary={"Cookie"})
     * @Security("has_role('ROLE_STAFF')")
     */
    public function createChildAction(Job $job, Request $request)
    {
        $child = new Job();
        $child->setStatus('Open');
        $child->setParent($job);
        $child->setMaster($job->getMaster());
        $child->setPriority($job->getPriority());
        $child->setClient($job->getClient());
        $child->setManager($job->getManager());
        $child->setType($job->getType());

        $form = $this->createForm(new ChildJobType(), $child);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $em = $this->getDoctrine()->getManager();

            $em->persist($child);
            $em->flush();

            return $this->redirect($this->generateUrl('jobs_resources_add_self', array('job' => $child->getId())));
        }

        return $this->render(
            'BusinessManJobBundle:Job:create_child.html.twig',
            array('job' => $job, 'form' => $form->createView())
        );
    }

    public function activityAssemblyAction()
    {
        
    }
}
