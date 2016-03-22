<?php
namespace BusinessMan\Bundle\ProjectBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use BusinessMan\Bundle\ProjectBundle\Entity\Project;

/**
 * ProjectController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/ProjectBundle
 */
class ProjectController extends Controller
{
    /**
     * List all projects
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400)
     * @Security("has_role('ROLE_STAFF')")
     */
    public function listAction()
    {
        return $this->render('BusinessManProjectBundle:Project:list.html.twig');
    }

    /**
     * View a project's details
     *
     * @param Project $project
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=60, lastModified="project.getLastModified()")
     * @Security("has_role('ROLE_STAFF')")
     */
    public function viewAction(Project $project)
    {
        return $this->render('BusinessManProjectBundle:Project:view.html.twig', array('project' => $project));
    }
}
